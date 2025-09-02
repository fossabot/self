
echo "🔧 Building test program..."
cd cmd/test && go build -o ../../test-verify-endpoint . && cd ../..

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo " Running Go API test..."
echo ""

./test-verify-endpoint

# Clean up
rm -f test-verify-endpoint

echo ""
echo " Test completed!"
