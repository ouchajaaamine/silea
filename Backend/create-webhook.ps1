# Script pour créer un webhook Monday.com
$token = "eyJhbGciOiJIUzI1NiJ9.eyJ0aWQiOjU5NjM5ODQxMCwiYWFpIjoxMSwidWlkIjo5NjgxOTM3OCwiaWFkIjoiMjAyNS0xMi0xMVQwMDozNjo0MS4wNjhaIiwicGVyIjoibWU6d3JpdGUiLCJhY3RpZCI6MzI2OTI2OTYsInJnbiI6ImV1YzEifQ.UqvHa8BmzQE_xRtTAWLjgWTh9BHCDgUYlaBWu4Nvhp4"
$boardId = "5088829162"
$webhookUrl = "https://undandled-ariane-nubbly.ngrok-free.dev/api/webhooks/monday"

$query = @"
mutation {
  create_webhook (board_id: $boardId, url: "$webhookUrl", event: change_column_value) {
    id
    board_id
  }
}
"@

$body = @{
    query = $query
} | ConvertTo-Json

$headers = @{
    "Authorization" = $token
    "Content-Type" = "application/json"
}

try {
    $response = Invoke-RestMethod -Uri "https://api.monday.com/v2" -Method Post -Headers $headers -Body $body
    Write-Host "Webhook créé avec succès !" -ForegroundColor Green
    Write-Host ($response | ConvertTo-Json -Depth 10)
} catch {
    Write-Host "Erreur lors de la création du webhook :" -ForegroundColor Red
    Write-Host $_.Exception.Message
    Write-Host $_.Exception.Response
}
