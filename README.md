# MacroFit

App web (PWA) para registrar calorías y macros: análisis de platos con IA (Gemini/Claude), productos de Mercadona y Lidl, Open Food Facts, código de barras y recetas según objetivo. Login y datos en Supabase.

## Puesta en marcha
1. Ejecuta `supabase-sql/schema.sql` en Supabase → SQL Editor.
2. Revisa `cloud-config.js` (URL del proyecto y publishable key).
3. En Supabase → Authentication → URL Configuration añade la URL de Netlify.
4. Despliega la carpeta en Netlify (sin build; `netlify.toml` incluido).
