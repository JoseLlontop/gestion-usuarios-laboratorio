import React, { Component, ErrorInfo, ReactNode } from 'react';
import { useNavigate, NavigateFunction } from 'react-router-dom';
import ErrorPage from '../pages/error/ErrorPage'; 

// ErrorBoundaryClass: captura errores de renderizado en componentes hijos
interface Props {
  children: ReactNode;            // Elementos hijos que pueden generar errores
}
interface State {
  hasError: boolean;             // Indica si ocurrió un error
}

class ErrorBoundaryClass extends Component<Props & { navigate: NavigateFunction }, State> {
  // Estado inicial: sin error
  state: State = { hasError: false };

  // Se ejecuta cuando un componente hijo arroja un error.
  // Actualiza state para renderizar la UI de fallback.
  static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  // Método para capturar detalles del error y poder reportarlos.
  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error capturado en ErrorBoundary:', error, info);
    // Aquí podrías enviar el error a un servicio externo (Sentry, LogRocket…)
  }

  // Al pulsar el botón de recarga, se limpia el estado y se navega a la ruta raiz
  handleReload = () => {
    this.setState({ hasError: false });
    this.props.navigate('/'); // Redirige al usuario al inicio
  };

  render() {
    // Si ocurrió un error
    if (this.state.hasError) {
    // Pasamos la función handleReload al ErrorPage
    return <ErrorPage onBack={this.handleReload} />;
}

    // Si no hay errores, renderiza los componentes hijos normalmente
    return this.props.children;
  }
}


// ErrorBoundary: wrapper funcional para proporcionar `navigate` via useNavigate
export const ErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();        // Hook para navegación programática
  // Pasa navigate al componente de clase ErrorBoundaryClass
  return <ErrorBoundaryClass navigate={navigate}>{children}</ErrorBoundaryClass>;
};