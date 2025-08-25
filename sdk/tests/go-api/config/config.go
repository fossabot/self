package config

import (
	"context"
	"encoding/json"
	"fmt"
	"sync"
	"time"

	self "github.com/selfxyz/self/sdk/sdk-go"
	"github.com/selfxyz/self/sdk/sdk-go/common"
)

// SelfAppDisclosureConfig matches TypeScript interface for disclosure options
type SelfAppDisclosureConfig struct {
	MinimumAge        *int                        `json:"minimumAge,omitempty"`
	Ofac              *bool                       `json:"ofac,omitempty"`
	ExcludedCountries []common.Country3LetterCode `json:"excludedCountries,omitempty"`
	IssuingState      *bool                       `json:"issuing_state,omitempty"`
	Name              *bool                       `json:"name,omitempty"`
	Nationality       *bool                       `json:"nationality,omitempty"`
	DateOfBirth       *bool                       `json:"date_of_birth,omitempty"`
	PassportNumber    *bool                       `json:"passport_number,omitempty"`
	Gender            *bool                       `json:"gender,omitempty"`
	ExpiryDate        *bool                       `json:"expiry_date,omitempty"`
}

// OptionStore represents a stored option with expiration
type OptionStore struct {
	Data   string    `json:"data"`
	Expiry time.Time `json:"expiry"`
}

// InMemoryConfigStore provides in-memory storage for configurations and options
type InMemoryConfigStore struct {
	mu      sync.RWMutex
	configs map[string]self.VerificationConfig
	options map[string]OptionStore
}

// NewInMemoryConfigStore creates a new in-memory config store
func NewInMemoryConfigStore() *InMemoryConfigStore {
	return &InMemoryConfigStore{
		configs: make(map[string]self.VerificationConfig),
		options: make(map[string]OptionStore),
	}
}

// SetWithExpiration stores a key-value pair with expiration (like Redis SET with EX)
func (store *InMemoryConfigStore) SetWithExpiration(ctx context.Context, key, value string, expiration time.Duration) error {
	store.mu.Lock()
	defer store.mu.Unlock()

	store.options[key] = OptionStore{
		Data:   value,
		Expiry: time.Now().Add(expiration),
	}

	return nil
}

// Get retrieves a value by key, returns empty string if not found or expired
func (store *InMemoryConfigStore) Get(ctx context.Context, key string) (string, error) {
	store.mu.RLock()
	defer store.mu.RUnlock()

	// Clean expired entries
	store.cleanExpiredUnsafe()

	if option, exists := store.options[key]; exists && time.Now().Before(option.Expiry) {
		return option.Data, nil
	}

	return "", fmt.Errorf("key not found or expired: %s", key)
}

// cleanExpiredUnsafe removes expired entries (must be called with lock held)
func (store *InMemoryConfigStore) cleanExpiredUnsafe() {
	now := time.Now()
	for key, option := range store.options {
		if now.After(option.Expiry) {
			delete(store.options, key)
		}
	}
}

// GetActionId implements the ConfigStore interface
func (store *InMemoryConfigStore) GetActionId(ctx context.Context, userIdentifier string, userDefinedData string) (string, error) {
	return userIdentifier, nil
}

// SetConfig implements the ConfigStore interface
func (store *InMemoryConfigStore) SetConfig(ctx context.Context, id string, config self.VerificationConfig) (bool, error) {
	store.mu.Lock()
	defer store.mu.Unlock()

	_, existed := store.configs[id]
	store.configs[id] = config
	return !existed, nil
}

// GetConfig implements the ConfigStore interface and returns self.VerificationConfig
func (store *InMemoryConfigStore) GetConfig(ctx context.Context, id string) (self.VerificationConfig, error) {
	// If found in regular config store, return it
	store.mu.RLock()
	config, exists := store.configs[id]
	store.mu.RUnlock()

	if exists {
		return config, nil
	}

	// Return empty config if not found (SDK will handle this)
	return self.VerificationConfig{}, nil
}

// GetSelfAppDisclosureConfig gets the SelfAppDisclosureConfig for user options
func (store *InMemoryConfigStore) GetSelfAppDisclosureConfig(ctx context.Context, id string) (SelfAppDisclosureConfig, error) {
	// Try to get from options store (for user options)
	optionsData, err := store.Get(ctx, id)
	if err == nil {
		var disclosureConfig SelfAppDisclosureConfig
		if err := json.Unmarshal([]byte(optionsData), &disclosureConfig); err != nil {
			return SelfAppDisclosureConfig{}, fmt.Errorf("failed to unmarshal disclosure config: %v", err)
		}
		return disclosureConfig, nil
	}

	// If not found in options, try regular config store
	store.mu.RLock()
	defer store.mu.RUnlock()

	if config, exists := store.configs[id]; exists {
		// Convert VerificationConfig to SelfAppDisclosureConfig
		disclosureConfig := SelfAppDisclosureConfig{
			MinimumAge:        &config.MinimumAge,
			Ofac:              &config.Ofac,
			ExcludedCountries: config.ExcludedCountries,
		}
		return disclosureConfig, nil
	}

	return SelfAppDisclosureConfig{}, fmt.Errorf("config not found for id: %s", id)
}

// Close cleans up resources (no-op for in-memory store)
func (store *InMemoryConfigStore) Close() error {
	return nil
}

// Global instance for the API
var globalConfigStore = NewInMemoryConfigStore()

// NewKVConfigStoreFromEnv creates a new config store (in-memory version)
func NewKVConfigStoreFromEnv() (*InMemoryConfigStore, error) {
	return globalConfigStore, nil
}
