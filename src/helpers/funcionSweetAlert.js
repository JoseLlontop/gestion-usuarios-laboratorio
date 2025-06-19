import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

// Función que muestra una alerta usando la librería SweetAlert2
// Recibe un mensaje, un icono y un elemento en el cual enfocarse después de mostrar la alerta
export function show_alerta(mensaje, icono, foco=''){

    // Llama a la función onfocus para enfocar el elemento específico, si se proporcionó
    onfocus(foco)

    // Crea una instancia de SweetAlert2 con soporte para React
    const MySwal = withReactContent(Swal)

    // Muestra una alerta con el mensaje y el icono proporcionados
    MySwal.fire({
        title: mensaje,
        icon: icono
    })
}

// Función que enfoca un elemento específico
function onfocus(foco) {
    // Verifica si se proporcionó un elemento para enfocar
    if (foco !== "") {
        // Utiliza el ID proporcionado para enfocar el elemento
        document.getElementById(foco).focus();
    }
}
