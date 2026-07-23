$files = Get-ChildItem -Path "C:\Users\ATTA\Desktop\SIMS\app\src" -Recurse -Filter "*.tsx"
foreach ($file in $files) {
    $lines = Get-Content $file.FullName
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        # Look for any text content between > and < that isn't a tag or expression
        # Pattern: >some text< where "some text" is not whitespace and not a tag
        $matches = [regex]::Matches($line, '>([^<>{]+)<')
        foreach ($m in $matches) {
            $text = $m.Groups[1].Value.Trim()
            if ($text -and $text -ne '' -and $text -notmatch '^\s*$') {
                # Skip if this line has <Text nearby
                if ($line -notmatch '<Text' -and $line -notmatch '</Text>') {
                    Write-Output "$($file.FullName):$($i+1): [$text] $line"
                }
            }
        }
    }
}
