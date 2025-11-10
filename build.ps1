# Stellar Smart Contract Build Script
# PowerShell script for building the contract

Write-Host "Building Stellar Smart Contract..." -ForegroundColor Green

# Build the contract
soroban contract build

if ($LASTEXITCODE -eq 0) {
    Write-Host "Build successful!" -ForegroundColor Green
    Write-Host "WASM file location: target/wasm32-unknown-unknown/release/stellar_contract.wasm" -ForegroundColor Cyan
} else {
    Write-Host "Build failed!" -ForegroundColor Red
    exit 1
}

