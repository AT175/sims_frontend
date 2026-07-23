$files = Get-ChildItem -Path "C:\Users\ATTA\Desktop\SIMS\app\src" -Recurse -Filter "*.tsx"
foreach ($file in $files) {
    $lines = Get-Content $file.FullName
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        # Look for JSX that has text content between tags that includes a period
        # But exclude lines that are inside template strings (backtick strings)
        if ($line -match '`') { continue }
        # Look for >text.< or >.< or >text.<text< patterns in JSX (not HTML in strings)
        if ($line -match '>[^<]*\.[^<]*<' -and $line -notmatch '<Text' -and $line -notmatch '</Text' -and $line -notmatch 'style=') {
            Write-Output "$($file.Name):$($i+1): $line"
        }
        # Look for JSX expressions with string containing just a period
        if ($line -match "\{'\.'\}" -or $line -match '\{"\."\}' -or $line -match "\{`\.`\}") {
            Write-Output "$($file.Name):$($i+1): [DOT-EXPR] $line"
        }
        # Look for {`.`} or {". "}
        if ($line -match '\{".*"\}' -and $line -notmatch '<Text' -and $line -notmatch 'style=') {
            Write-Output "$($file.Name):$($i+1): [STRING-EXPR] $line"
        }
    }
}
