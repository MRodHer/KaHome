$inputFile = "C:\Users\mauri\Documents\trae_projects\KaHome\ZipCodesMX\dump\3cat_cp-data.sql"
$outputFile = "c:\Users\mauri\Documents\trae_projects\KaHome\supabase\migrations\20251114183553_seed_postal_codes_data.sql"

$values = [System.Collections.Generic.List[string]]::new()
# Regex to capture the values from the INSERT statements
$regex = [regex]"VALUES \((\d+),(\d+),(\d+),(\d+),'(.*)'\);"

Get-Content $inputFile -Encoding UTF8 | ForEach-Object {
    $match = $regex.Match($_)
    if ($match.Success) {
        $idcp = $match.Groups[1].Value
        $idmunicipio = $match.Groups[2].Value
        $idestado = $match.Groups[3].Value
        $cp = $match.Groups[4].Value
        $colonia = $match.Groups[5].Value.Replace("'", "''")
        
        $values.Add("($idcp, $idmunicipio, $idestado, $cp, '$colonia')")
    }
}

if ($values.Count -gt 0) {
    $insertStatement = "`n`nINSERT INTO public.cat_cp (idcp, idmunicipio, idestado, cp, colonia) VALUES`n" + ($values -join ",`n") + ";`n"
    Add-Content -Path $outputFile -Value $insertStatement -Encoding UTF8
    Write-Output "Successfully processed $($values.Count) records and updated migration file."
} else {
    Write-Output "No data found to process."
}