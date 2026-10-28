const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const readline = require('node:readline');

const archivoEnv = path.join(__dirname, '.env');
if (!fs.existsSync(archivoEnv)) {
  console.error('No existe backend/.env. Créalo copiando backend/.env.example y vuelve a intentarlo.');
  process.exit(1);
}

const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
terminal.question('Escribe la nueva contraseña del administrador: ', (contrasena) => {
  if (!contrasena) {
    console.error('La contraseña no puede estar vacía.');
    terminal.close();
    process.exitCode = 1;
    return;
  }

  const sal = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(contrasena, sal, 64).toString('hex');
  const lineaHash = `ADMIN_PASSWORD_HASH=scrypt$${sal}$${hash}`;
  let contenido = fs.readFileSync(archivoEnv, 'utf8');

  if (/^ADMIN_PASSWORD_HASH=/m.test(contenido)) {
    contenido = contenido.replace(/^ADMIN_PASSWORD_HASH=.*$/m, lineaHash);
  } else {
    contenido = `${contenido.replace(/\s*$/, '')}\n${lineaHash}\n`;
  }

  fs.writeFileSync(archivoEnv, contenido, 'utf8');
  console.log('Clave guardada en backend/.env. Inicia sesión usando la contraseña que acabas de escribir.');
  terminal.close();
});
