$password = "MHA1989Hovo"
$commands = @"
cd /home/server_local_arm/apps/portfolio404
git pull
pnpm install --frozen-lockfile
pnpm prisma migrate deploy
pnpm build
pm2 restart portfolio404
"@

# Write commands to temp script on server
$encodedCommands = [Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($commands))
Write-Host "Deploy script ready. Run manually on server."
