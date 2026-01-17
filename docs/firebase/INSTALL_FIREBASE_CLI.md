# Instalación de Firebase CLI

## 🔴 Error: "El término 'firebase' no se reconoce"

Esto significa que Firebase CLI no está instalado en tu sistema.

## ✅ Solución: Instalar Firebase CLI

### Opción 1: Instalación Global con npm (Recomendado)

Abre **PowerShell como Administrador** y ejecuta:

```bash
npm install -g firebase-tools
```

**Tiempo estimado:** 2-3 minutos

### Opción 2: Usando npm en el proyecto

Si la instalación global falla, puedes usar npx:

```bash
npx firebase-tools login
npx firebase-tools deploy --only hosting
```

### Opción 3: Verificar instalación existente

Si crees que ya está instalado pero no se reconoce:

```bash
# Verificar ubicación de npm global
npm config get prefix

# Agregar a PATH manualmente
# Windows: %USERPROFILE%\AppData\Roaming\npm
```

## 📝 Pasos Completos

### 1. Instalar Firebase CLI

```powershell
# Abrir PowerShell como Administrador
npm install -g firebase-tools
```

### 2. Verificar instalación

```bash
firebase --version
```

Deberías ver algo como: `13.x.x` o similar

### 3. Login en Firebase

```bash
firebase login
```

Esto abrirá tu navegador para autenticarte con Google.

### 4. Verificar proyecto

```bash
firebase projects:list
```

Deberías ver `proto-c51d8` en la lista.

### 5. Build y Deploy

```bash
# En la carpeta del proyecto
npm run deploy
```

O paso a paso:

```bash
npm run build:prod
firebase deploy --only hosting
```

## 🐛 Problemas Comunes

### Error: "npm: command not found"

**Solución:** Instala Node.js primero
- Descarga: https://nodejs.org/
- Versión recomendada: LTS (Long Term Support)

### Error: "Permission denied"

**Solución en Windows:**
1. Abre PowerShell **como Administrador**
2. Ejecuta: `Set-ExecutionPolicy RemoteSigned`
3. Intenta instalar nuevamente

### Error: "Cannot find module"

**Solución:**
```bash
npm cache clean --force
npm install -g firebase-tools
```

### Firebase CLI instalado pero no reconocido

**Solución Windows:**
1. Abre "Variables de entorno"
2. En PATH del usuario, agrega:
   ```
   %USERPROFILE%\AppData\Roaming\npm
   ```
3. Reinicia la terminal

**Verificar ruta de instalación:**
```bash
npm config get prefix
```

## 🔄 Alternativa: Usar npx (Sin instalar globalmente)

Si no puedes o no quieres instalar globalmente, usa `npx`:

```bash
# Login
npx firebase-tools login

# Deploy
npm run build:prod
npx firebase-tools deploy --only hosting

# Ver proyectos
npx firebase-tools projects:list
```

**Nota:** `npx` descargará la herramienta temporalmente cada vez.

## ✅ Verificación Post-Instalación

Después de instalar, verifica que todo funciona:

```bash
# Ver versión
firebase --version

# Ver comandos disponibles
firebase --help

# Ver proyectos
firebase projects:list

# Verificar proyecto actual
firebase use
```

## 🎯 Siguiente Paso

Una vez instalado Firebase CLI, ejecuta:

```bash
firebase login
npm run deploy
```

## 📚 Recursos

- **Firebase CLI Docs**: https://firebase.google.com/docs/cli
- **Instalación oficial**: https://firebase.google.com/docs/cli#install_the_firebase_cli
- **Troubleshooting**: https://firebase.google.com/docs/cli#troubleshooting

## 💡 Tip: Scripts del Proyecto

Una vez instalado Firebase CLI, estos scripts estarán disponibles:

```json
{
  "deploy": "ng build --configuration production && firebase deploy --only hosting",
  "deploy:preview": "ng build --configuration production && firebase hosting:channel:deploy preview",
  "firebase:serve": "ng build --configuration production && firebase serve"
}
```

Úsalos con:
```bash
npm run deploy
npm run deploy:preview
npm run firebase:serve
```

---

**Estado:** ⏳ Instalando Firebase CLI en segundo plano...

Cuando termine, ejecuta:
```bash
firebase login
npm run deploy
```
