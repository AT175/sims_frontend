$files = Get-ChildItem -Path "C:\Users\ATTA\Desktop\SIMS\app\src" -Recurse -Filter "*.tsx"
foreach ($file in $files) {
    $lines = Get-Content $file.FullName
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        # Look for patterns like >text< or >.< where text is not inside Text tags
        # Specifically look for raw text between > and < that isn't a tag
        if ($line -match '>\s*\.+\s*<' -and $line -notmatch '<Text' -and $line -notmatch '</Text') {
            Write-Output "$($file.FullName):$($i+1): $line"
        }
        # Also look for expressions like {'.'} or {". "}
        if ($line -match "\{'\.'\}" -or $line -match '\{"\."\}') {
            Write-Output "$($file.FullName):$($i+1): [EXPR] $line"
        }
    }
}
