$migrationFile = "c:\Users\mauri\Documents\trae_projects\KaHome\supabase\migrations\20251114183553_seed_postal_codes_data.sql"

# Read the content of the migration file
$content = Get-Content $migrationFile -Raw

# Split the content by INSERT statements, keeping the delimiter
$inserts = $content -split '(\nINSERT INTO)' | Where-Object { $_ -ne '' }

$cleanedInserts = @()
for ($i = 0; $i -lt $inserts.Length; $i += 2) {
    if ($i + 1 -lt $inserts.Length) {
        $statement = $inserts[$i+1] + $inserts[$i+2]
        # Ensure each statement ends with a semicolon
        if (-not $statement.Trim().EndsWith(';')) {
            $statement = $statement.Trim() + ";"
        }
        $cleanedInserts += $statement
    }
}

# Join the cleaned statements back together and remove empty lines
$content = ($cleanedInserts -join "`n`n") -split "`n" | Where-Object { $_.Trim() -ne '' } | Out-String

# Perform the replacements
$content = $content -replace 'public.cat_estados \(id, nombre\)', 'public.cat_estados (idestado, estado)'
$content = $content -replace 'public.cat_municipios \(id, id_estado, nombre\)', 'public.cat_municipios (idmunicipio, idestado, municipio)'
$content = $content -replace 'public.cat_codigos_postales \(id, codigo_postal, asentamiento, tipo_asentamiento, id_municipio, id_estado\)', 'public.cat_cp (idcp, cp, colonia, idmunicipio, idestado)'

# Regex to remove the empty tipo_asentamiento value
$content = $content -replace "\( (\d+, '\d+', '.*?'), '', (\d+, \d+) \)", "( `$1, `$2 )"

# Write the updated content back to the migration file
Set-Content -Path $migrationFile -Value $content -Encoding UTF8

Write-Output "Migration file successfully updated."