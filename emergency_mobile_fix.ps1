# EMERGENCY MOBILE FIX SCRIPT
$file = "client\src\pages\SchoolAdmin\Dashboard.jsx"
$content = Get-Content $file -Raw

# 1. Move hamburger to right, add padding to content
$content = $content -replace 'className="lg:hidden fixed top-4 left-4', 'className="lg:hidden fixed top-4 right-4'
$content = $content -replace 'className="flex-1 p-4 sm:p-6 lg:p-10 overflow-auto"', 'className="flex-1 p-4 sm:p-6 lg:p-10 overflow-auto pt-16 lg:pt-4"'

# 2. Make ALL grids responsive
$content = $content -replace 'grid grid-cols-2 gap', 'grid grid-cols-1 md:grid-cols-2 gap'
$content = $content -replace 'grid grid-cols-3 gap', 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap'
$content = $content -replace 'grid grid-cols-4 gap', 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap'

# 3. Add text-base to all inputs
$content = $content -replace '(className="[^"]*border-2[^"]*rounded-lg[^"]*transition-all)"', '$1 text-base"'

# 4. Make  headings responsive
$content = $content -replace 'text-3xl font-bold text-gray-800', 'text-xl sm:text-2xl md:text-3xl font-bold text-gray-800'
$content = $content -replace 'text-xl font-bold', 'text-lg sm:text-xl font-bold'

# 5. Stack buttons on mobile
$content = $content -replace '(<div className="flex) gap-3">', '$1 flex-col sm:flex-row gap-3">'

# 6. Make buttons full-width on mobile
$content = $content -replace '(className="[^"]*bg-gradient-to-r[^"]*px-8 py-3[^"]*)', '$1 w-full sm:w-auto'

# 7. Responsive padding for cards
$content = $content -replace 'p-6 rounded-2xl', 'p-4 sm:p-6 rounded-2xl'
$content = $content -replace 'p-5 rounded-xl', 'p-4 sm:p-5 rounded-xl'

# 8. Fee table mobile scroll
$content = $content -replace '(<div className="overflow-x-auto">)', '$1' + "`n" + '                                    <div className="inline-block min-w-full">'
$content = $content -replace '(</table>\s*</div>)', '</table>' + "`n" + '                                    </div>' + "`n" + '                                </div>'

# Save
$content | Set-Content $file -Encoding UTF8

Write-Host "✅ MOBILE FIXES APPLIED! Dashboard is now mobile-responsive!"
Write-Host "Restart dev  server: Ctrl+C then 'npm run dev'"
