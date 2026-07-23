$files = Get-ChildItem -Path "C:\Users\ATTA\Desktop\SIMS\app\src" -Recurse -Filter "*.tsx"
foreach ($file in $files) {
    $lines = Get-Content $file.FullName
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        # Skip lines inside template literals (backtick strings)
        if ($line -match '^\s*.*`' -and $line -notmatch '\*/') { continue }
        # Look for JSX expressions that might render a period: {'. '}  {". "}  {`.`}  {'.'}
        if ($line -match "\{['""`]\.['""`]\}") {
            Write-Output "$($file.Name):$($i+1): [DOT-EXPR] $line"
        }
        # Look for any expression {something} that's a direct child of View (not inside Text)
        # Check if line has <View> and an expression that could be text
        if ($line -match '<View' -and $line -match '\{[^}]*\}' -and $line -notmatch '<Text' -and $line -notmatch 'style=') {
            Write-Output "$($file.Name):$($i+1): [VIEW-EXPR] $line"
        }
    }
}
# Also check App.tsx
$file = "C:\Users\ATTA\Desktop\SIMS\app\App.tsx"
$lines = Get-Content $file
for ($i = 0; $i -lt $lines.Count; $i++) {
    $line = $lines[$i]
    if ($line -match "\{['""`]\.['""`]\}") {
        Write-Output "App.tsx:$($i+1): [DOT-EXPR] $line"
    }
}
