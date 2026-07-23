$urls = @(
    'http://localhost:8082/src/dashboards/index.ts',
    'http://localhost:8082/src/screens/LoginScreen.tsx',
    'http://localhost:8082/src/shared/store/authStore.ts',
    'http://localhost:8082/src/shared/components/DashboardLayout.tsx',
    'http://localhost:8082/src/shared/theme/index.ts'
)
foreach ($url in $urls) {
    try {
        $r = Invoke-WebRequest -Uri $url -UseBasicParsing
        Write-Output "OK ($($r.StatusCode)): $url ($($r.Content.Length) chars)"
    } catch {
        Write-Output "FAIL: $url - $($_.Exception.Message)"
    }
}
