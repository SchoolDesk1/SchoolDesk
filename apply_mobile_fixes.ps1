# Apply comprehensive mobile UI fixes to Dashboard.jsx
$file = "client\src\pages\SchoolAdmin\Dashboard.jsx"
$content = Get-Content $file -Raw

# Fix Teacher form grid
$content = $content -replace 'Teachers Tab.*?grid grid-cols-2', 'Teachers Tab.*?grid grid-cols-1 md:grid-cols-2' 

# Add text-base to all inputs and textareas in remaining sections  
$content = $content -replace '(className="[^"]*border-2[^"]*rounded-lg[^"]*transition-all)"', '$1 text-base"'

# Fix headings to be responsive
$content = $content -replace 'text-3xl font-bold text-gray-800', 'text-2xl sm:text-3xl font-bold text-gray-800'
$content = $content -replace 'text-xl font-bold', 'text-lg sm:text-xl font-bold'

# Make all 2-column grids responsive (except already fixed)
$content = $content -replace 'grid grid-cols-2 gap', 'grid grid-cols-1 md:grid-cols-2 gap'

# Fix buttons to stack on mobile
$content = $content -replace '(<div className="flex) gap-3">', '$1 flex-col sm:flex-row gap-3">'

# Add word-break to card text
$content = $content -replace '(text-sm text-gray-700)">', '$1 break-words">'

# Save
$content | Set-Content $file

Write-Host "Mobile UI fixes applied successfully!"
