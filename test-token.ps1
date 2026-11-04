$clientId     = "2C9uuTkO7EC96maT3ewQLANt6tag6knC"
$clientSecret = "WfZbPITTd66c4EgtmHiRmCk1EuTzZQmaROQv0fG-twd0PTcZ_4v86AHN6yuIzDtx"

$pair   = "${clientId}:${clientSecret}"
$bytes  = [System.Text.Encoding]::ASCII.GetBytes($pair)
$base64 = [Convert]::ToBase64String($bytes)

$headers = @{
    "Authorization" = "Basic $base64"
    "Content-Type"  = "application/x-www-form-urlencoded"
}

$body = @{
    grant_type = "password"
    username   = "TP64182677"
    password   = 'y(74nbu$Df^D]'
}

$response = Invoke-RestMethod -Method Post -Uri "https://auth.pp.travelport.net/oauth/token" -Headers $headers -Body $body
$response
