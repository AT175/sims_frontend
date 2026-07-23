$files = Get-ChildItem -Path "C:\Users\ATTA\Desktop\SIMS\app\src" -Recurse -Filter "*.tsx"
$results = @()
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $lines = Get-Content $file.FullName
    # Look for multi-line JSX that might have stray text between tags
    # Pattern: closing > on one line, then text on next line, then opening < on another
    for ($i = 0; $i -lt $lines.Count - 1; $i++) {
        $curr = $lines[$i].Trim()
        $next = $lines[$i + 1].Trim()
        # Check if current line ends with > and next line is just text (not starting with < or { or })
        if ($curr -match '>$' -and $next -and $next -notmatch '^[<{}/]' -and $next -notmatch '^\s*$' -and $curr -notmatch '</Text>' -and $curr -notmatch '<Text') {
            $results += "$($file.Name):$($i+1)-$($i+2): [$next] $($lines[$i]) | $next"
        }
    }
}
$results | ForEach-Object { Write-Output $_ }
Write-Output "Total found: $($results.Count)"
