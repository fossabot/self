package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
)

// ProofData represents the structure of the proof JSON file
type ProofData struct {
	Proof         interface{} `json:"proof"`
	PublicSignals interface{} `json:"publicSignals"`
}

// TestRequest represents the request body structure
type TestRequest struct {
	AttestationID   int         `json:"attestationId"`
	Proof           interface{} `json:"proof"`
	PublicSignals   interface{} `json:"publicSignals"`
	UserContextData string      `json:"userContextData"`
}

// TestResponse represents the response structure
type TestResponse struct {
	Status              string      `json:"status"`
	Result              bool        `json:"result"`
	Message             string      `json:"message,omitempty"`
	Details             interface{} `json:"details,omitempty"`
	CredentialSubject   interface{} `json:"credentialSubject,omitempty"`
	VerificationOptions interface{} `json:"verificationOptions,omitempty"`
}

func main() {
	// Configuration
	apiURL := "http://localhost:8080"
	endpoint := fmt.Sprintf("%s/api/verify", apiURL)

	// Set the proof data file path using relative path
	proofFilePath := filepath.Join("..", "ts-api", "vc_and_disclose_proof.json")

	fmt.Printf("📄 Using proof file: %s\n", proofFilePath)

	// Read the proof data from JSON file
	proofFile, err := os.Open(proofFilePath)
	if err != nil {
		fmt.Printf("❌ Error opening proof file: %v\n", err)
		os.Exit(1)
	}
	defer proofFile.Close()

	var proofData ProofData
	if err := json.NewDecoder(proofFile).Decode(&proofData); err != nil {
		fmt.Printf("❌ Error parsing proof JSON: %v\n", err)
		os.Exit(1)
	}

	// Create request body
	requestBody := TestRequest{
		AttestationID:   1,
		Proof:           proofData.Proof,
		PublicSignals:   proofData.PublicSignals,
		UserContextData: "000000000000000000000000000000000000000000000000000000000000a4ec00000000000000000000000094ba0db8a9db66979905784a9d6b2d286e55bd27",
	}

	fmt.Println("🧪 Testing verify endpoint with real proof data...")
	fmt.Println("📋 Request body:")

	// Pretty print the request body
	requestJSON, err := json.MarshalIndent(requestBody, "", "  ")
	if err != nil {
		fmt.Printf("❌ Error marshaling request: %v\n", err)
		os.Exit(1)
	}
	fmt.Println(string(requestJSON))

	fmt.Printf("\n🚀 Sending request to: %s\n", endpoint)

	// Create HTTP request
	httpRequestBody, err := json.Marshal(requestBody)
	if err != nil {
		fmt.Printf("❌ Error marshaling request body: %v\n", err)
		os.Exit(1)
	}

	req, err := http.NewRequest("POST", endpoint, bytes.NewBuffer(httpRequestBody))
	if err != nil {
		fmt.Printf("❌ Error creating HTTP request: %v\n", err)
		os.Exit(1)
	}

	req.Header.Set("Content-Type", "application/json")

	// Make the HTTP request
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		fmt.Printf("\n💥 Error making request: %v\n", err)
		fmt.Println("\nMake sure the server is running on port 8080")
		fmt.Println("You can start it with: make run or go run main.go")
		os.Exit(1)
	}
	defer resp.Body.Close()

	// Read response body
	responseBody, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("❌ Error reading response: %v\n", err)
		os.Exit(1)
	}

	fmt.Printf("\n📊 Response Status: %d\n", resp.StatusCode)
	fmt.Println("📄 Response Body:")

	// Try to parse as JSON for pretty printing
	var jsonResponse interface{}
	if err := json.Unmarshal(responseBody, &jsonResponse); err != nil {
		// If JSON parsing fails, just print the raw response
		fmt.Println(string(responseBody))
	} else {
		// Pretty print the JSON response
		prettyJSON, err := json.MarshalIndent(jsonResponse, "", "  ")
		if err != nil {
			fmt.Println(string(responseBody))
		} else {
			fmt.Println(string(prettyJSON))
		}
	}

	// Check if verification succeeded
	if resp.StatusCode == 200 {
		var testResp TestResponse
		if err := json.Unmarshal(responseBody, &testResp); err == nil && testResp.Result {
			fmt.Println("\n✅ Verification succeeded!")
		} else {
			fmt.Println("\n❌ Verification failed")
		}
	} else {
		fmt.Println("\n❌ Verification failed")
	}
}
