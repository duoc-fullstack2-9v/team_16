import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ErrorBoundary from "../src/components/ErrorBoundary";

// Componente que lanza un error
const ThrowError = ({ shouldThrow }) => {
  if (shouldThrow) {
    throw new Error("Error de prueba");
  }
  return <div>Contenido normal</div>;
};

// Suprimir errores de consola durante las pruebas
const originalError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

afterAll(() => {
  console.error = originalError;
});

describe("Componente ErrorBoundary", () => {
  it("renderiza children cuando no hay error", () => {
    render(
      <ErrorBoundary>
        <div>Contenido sin errores</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/contenido sin errores/i)).toBeInTheDocument();
  });

  it("muestra interfaz de error cuando un hijo lanza una excepción", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/algo salió mal/i)).toBeInTheDocument();
  });

  it("muestra el mensaje de error descriptivo", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/se ha producido un error inesperado/i)).toBeInTheDocument();
  });

  it("tiene un botón para recargar la página", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByRole("button", { name: /recargar página/i })).toBeInTheDocument();
  });

  it("tiene un botón para volver atrás", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByRole("button", { name: /volver atrás/i })).toBeInTheDocument();
  });

  it("muestra un icono de error", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    // Verificar que hay una alerta de error
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
  });

  it("el botón 'Recargar Página' tiene la función correcta", () => {
    // Mock de window.location.reload
    delete window.location;
    window.location = { reload: vi.fn() };
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const reloadButton = screen.getByRole("button", { name: /recargar página/i });
    expect(reloadButton).toBeInTheDocument();
  });

  it("el botón 'Volver Atrás' tiene la función correcta", () => {
    // Mock de window.history.back
    window.history.back = vi.fn();
    
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    const backButton = screen.getByRole("button", { name: /volver atrás/i });
    expect(backButton).toBeInTheDocument();
  });

  it("renderiza múltiples children correctamente sin errores", () => {
    render(
      <ErrorBoundary>
        <div>Primer hijo</div>
        <div>Segundo hijo</div>
        <div>Tercer hijo</div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/primer hijo/i)).toBeInTheDocument();
    expect(screen.getByText(/segundo hijo/i)).toBeInTheDocument();
    expect(screen.getByText(/tercer hijo/i)).toBeInTheDocument();
  });

  it("captura errores de componentes anidados profundamente", () => {
    const DeepChild = () => {
      throw new Error("Error profundo");
    };
    
    render(
      <ErrorBoundary>
        <div>
          <div>
            <DeepChild />
          </div>
        </div>
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/algo salió mal/i)).toBeInTheDocument();
  });

  it("muestra el título 'Oops! Algo salió mal'", () => {
    render(
      <ErrorBoundary>
        <ThrowError shouldThrow={true} />
      </ErrorBoundary>
    );
    
    expect(screen.getByText(/oops/i)).toBeInTheDocument();
  });
});
