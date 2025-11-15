$inputFile = "C:\Users\mauri\Documents\trae_projects\KaHome\ZipCodesMX\dump\2cat_municipios-data.sql"
$outputFile = "c:\Users\mauri\Documents\trae_projects\KaHome\supabase\migrations\20251114183553_seed_postal_codes_data.sql"

$values = [System.Collections.Generic.List[string]]::new()
Get-Content $inputFile -Encoding UTF8 | ForEach-Object {
    if ($_ -match "VALUES \((\d+),(\d+),'(.*)'\);") {
        $idmunicipio = $matches[1]
        $idestado = $matches[2]
        $municipio = $matches[3].Replace("'", "''")
        $values.Add("($idmunicipio, $idestado, '$municipio')")
    }
}

if ($values.Count -gt 0) {
    $insertStatement = "`n`nINSERT INTO public.cat_municipios (idmunicipio, idestado, municipio) VALUES`n" + ($values -join ",`n") + ";`n"
    Add-Content -Path $outputFile -Value $insertStatement -Encoding UTF8
    Write-Output "Successfully processed $($values.Count) records and updated migration file."
} else {
    Write-Output "No data found to process."
}