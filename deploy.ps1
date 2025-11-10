# Stellar Smart Contract Deploy Script
# PowerShell script for deploying to testnet

param(
    [Parameter(Mandatory=$true)]
    [string]$KeyName,
    
    [Parameter(Mandatory=$false)]
    [string]$Network = "testnet"
)

Write-Host "Deploying Stellar Smart Contract to $Network..." -ForegroundColor Green

$wasmPath = "target/wasm32-unknown-unknown/release/stellar_contract.wasm"

if (-not (Test-Path $wasmPath)) {
    Write-Host "WASM file not found. Building contract first..." -ForegroundColor Yellow
    soroban contract build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Build failed!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Deploying contract..." -ForegroundColor Cyan
$contractId = soroban contract deploy --wasm $wasmPath --source $KeyName --network $Network

if ($LASTEXITCODE -eq 0) {
    Write-Host "Deployment successful!" -ForegroundColor Green
    Write-Host "Contract ID: $contractId" -ForegroundColor Cyan
    Write-Host "`nTo initialize the contract, run:" -ForegroundColor Yellow
    Write-Host "soroban contract invoke --id $contractId --source $KeyName --network $Network -- initialize --initial_balance 1000" -ForegroundColor White
} else {
    Write-Host "Deployment failed!" -ForegroundColor Red
    exit 1
}

