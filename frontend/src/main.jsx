import { createRoot } from 'react-dom/client';
import { Catalogo, Destacados, conectarFormularioPedido } from './Store.jsx';

const catalogo = document.getElementById('cuadricula-productos');
const destacados = document.getElementById('cuadricula-destacados');
if (catalogo) createRoot(catalogo).render(<Catalogo />);
if (destacados) createRoot(destacados).render(<Destacados />);
conectarFormularioPedido();
