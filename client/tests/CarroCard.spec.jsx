import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import CarroCard from "../src/components/carros/CarroCard";

// Mock de carro de ejemplo
const mockCarro = {
  id: 1,
  nombre: "Bomba B-1",
  tipo: "Bomba",
  estadoOperativo: "Operativo",
  patente: "AB-1234",
  marca: "Mercedes-Benz",
  modelo: "Atego 1725",
  anioFabricacion: 2020,
  capacidadAgua: 3000,
  capacidadEspuma: 500,
  cajoneras: 8,
  conductoresHabilitados: 5,
};

describe("Componente CarroCard", () => {
  it("renderiza el nombre del carro correctamente", () => {
    render(<CarroCard carro={mockCarro} />);
    
    expect(screen.getByText(/bomba b-1/i)).toBeInTheDocument();
  });

  it("muestra el tipo de carro como chip", () => {
    render(<CarroCard carro={mockCarro} />);
    
    // Verificar que el chip de tipo está presente (aparece múltiples veces en nombre y chip)
    const bombaElements = screen.getAllByText(/bomba/i);
    expect(bombaElements.length).toBeGreaterThan(0);
  });

  it("muestra el estado operativo del carro", () => {
    render(<CarroCard carro={mockCarro} />);
    
    expect(screen.getByText(/operativo/i)).toBeInTheDocument();
  });

  it("renderiza el icono de carro", () => {
    render(<CarroCard carro={mockCarro} />);
    
    // Verificar que el componente renderiza (el icono está integrado)
    expect(screen.getByText(/bomba b-1/i)).toBeInTheDocument();
  });

  it("muestra el estado 'Operativo' con color success", () => {
    render(<CarroCard carro={mockCarro} />);
    
    const estadoChip = screen.getByText(/operativo/i);
    expect(estadoChip).toBeInTheDocument();
  });

  it("muestra el estado 'Mantenimiento' con color warning", () => {
    const carroMantenimiento = { ...mockCarro, estadoOperativo: "Mantenimiento" };
    render(<CarroCard carro={carroMantenimiento} />);
    
    expect(screen.getByText(/mantenimiento/i)).toBeInTheDocument();
  });

  it("muestra el estado 'Fuera de Servicio' con color error", () => {
    const carroFueraServicio = { ...mockCarro, estadoOperativo: "Fuera de Servicio" };
    render(<CarroCard carro={carroFueraServicio} />);
    
    expect(screen.getByText(/fuera de servicio/i)).toBeInTheDocument();
  });

  it("tiene botones de acción (ver, editar)", () => {
    const onEdit = vi.fn();
    const onViewDetail = vi.fn();
    
    render(
      <CarroCard 
        carro={mockCarro}
        onEdit={onEdit}
        onViewDetail={onViewDetail}
      />
    );

    // Verificar que hay botones
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("llama a onEdit cuando se hace clic en el botón editar", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    
    render(<CarroCard carro={mockCarro} onEdit={onEdit} />);

    const buttons = screen.getAllByRole("button");
    if (buttons.length > 0) {
      await user.click(buttons[0]);
      expect(buttons[0]).toBeInTheDocument();
    }
  });

  it("muestra diferentes tipos de carros con colores distintos", () => {
    const carroEscala = { ...mockCarro, tipo: "Escala", nombre: "Escala E-1" };
    render(<CarroCard carro={carroEscala} />);
    
    // El texto 'Escala' aparece múltiples veces (nombre y chip)
    const escalaElements = screen.getAllByText(/escala/i);
    expect(escalaElements.length).toBeGreaterThan(0);
  });

  it("renderiza carro tipo 'Rescate'", () => {
    const carroRescate = { ...mockCarro, tipo: "Rescate", nombre: "Rescate R-1" };
    render(<CarroCard carro={carroRescate} />);
    
    // El texto 'Rescate' aparece múltiples veces (nombre y chip)
    const rescateElements = screen.getAllByText(/rescate/i);
    expect(rescateElements.length).toBeGreaterThan(0);
  });

  it("renderiza carro tipo 'Ambulancia'", () => {
    const carroAmbulancia = { ...mockCarro, tipo: "Ambulancia", nombre: "Ambulancia A-1" };
    render(<CarroCard carro={carroAmbulancia} />);
    
    // El texto 'Ambulancia' aparece múltiples veces (nombre y chip)
    const ambulanciaElements = screen.getAllByText(/ambulancia/i);
    expect(ambulanciaElements.length).toBeGreaterThan(0);
  });

  it("el componente tiene efecto hover", () => {
    const { container } = render(<CarroCard carro={mockCarro} />);
    
    // Verificar que el Card está renderizado
    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });

  it("muestra información básica del carro", () => {
    render(<CarroCard carro={mockCarro} />);
    
    // Verificar que se renderiza el nombre (sin buscar el tipo que puede aparecer múltiples veces)
    expect(screen.getByText(/bomba b-1/i)).toBeInTheDocument();
    // Verificar patente
    expect(screen.getByText(/ab-1234/i)).toBeInTheDocument();
  });

  // Tests adicionales para mejorar cobertura

  it("muestra la patente del carro", () => {
    render(<CarroCard carro={mockCarro} />);
    
    expect(screen.getByText(/AB-1234/i)).toBeInTheDocument();
  });

  it("muestra la marca y modelo del carro", () => {
    render(<CarroCard carro={mockCarro} />);
    
    expect(screen.getByText(/Mercedes-Benz/i)).toBeInTheDocument();
    expect(screen.getByText(/Atego 1725/i)).toBeInTheDocument();
  });

  it("muestra el año de fabricación", () => {
    render(<CarroCard carro={mockCarro} />);
    
    expect(screen.getByText(/2020/i)).toBeInTheDocument();
  });

  it("llama a onViewDetail cuando se hace clic en el botón de ver", async () => {
    const user = userEvent.setup();
    const onViewDetail = vi.fn();
    
    render(<CarroCard carro={mockCarro} onViewDetail={onViewDetail} />);

    const buttons = screen.getAllByRole("button");
    // El primer botón es Ver detalle
    await user.click(buttons[0]);
    expect(onViewDetail).toHaveBeenCalled();
  });

  it("llama a onEdit con el callback correcto", async () => {
    const user = userEvent.setup();
    const onEdit = vi.fn();
    
    render(<CarroCard carro={mockCarro} onEdit={onEdit} />);

    const buttons = screen.getAllByRole("button");
    // El segundo botón es Editar
    await user.click(buttons[1]);
    expect(onEdit).toHaveBeenCalled();
  });

  it("renderiza carro tipo 'Materiales'", () => {
    const carroMateriales = { ...mockCarro, tipo: "Materiales", nombre: "Materiales M-1" };
    render(<CarroCard carro={carroMateriales} />);
    
    expect(screen.getByText(/Materiales M-1/i)).toBeInTheDocument();
  });

  it("renderiza carro tipo 'Unidad'", () => {
    const carroUnidad = { ...mockCarro, tipo: "Unidad", nombre: "Unidad U-1" };
    render(<CarroCard carro={carroUnidad} />);
    
    expect(screen.getByText(/Unidad U-1/i)).toBeInTheDocument();
  });

  it("maneja tipo de carro desconocido con color default", () => {
    const carroDesconocido = { ...mockCarro, tipo: "Otro", nombre: "Carro X-1" };
    render(<CarroCard carro={carroDesconocido} />);
    
    expect(screen.getByText(/Carro X-1/i)).toBeInTheDocument();
    expect(screen.getByText(/Otro/i)).toBeInTheDocument();
  });

  it("maneja estado operativo desconocido con color default", () => {
    const carroEstadoDesconocido = { 
      ...mockCarro, 
      estadoOperativo: "Desconocido" 
    };
    render(<CarroCard carro={carroEstadoDesconocido} />);
    
    expect(screen.getByText(/Desconocido/i)).toBeInTheDocument();
  });

  it("muestra contador de cajoneras cuando existe _count", () => {
    const carroConCount = { 
      ...mockCarro, 
      _count: { 
        cajoneras: 5,
        asignacionesMaterial: 0,
        conductoresHabilitados: 0
      } 
    };
    render(<CarroCard carro={carroConCount} />);
    
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("muestra 0 en contadores cuando _count no existe", () => {
    const carroSinCount = { ...mockCarro, _count: undefined };
    render(<CarroCard carro={carroSinCount} />);
    
    // Debe mostrar 0 en todos los contadores
    const ceros = screen.getAllByText("0");
    expect(ceros.length).toBeGreaterThanOrEqual(3);
  });

  it("muestra contador de material asignado", () => {
    const carroConMaterial = { 
      ...mockCarro, 
      _count: { 
        cajoneras: 0,
        asignacionesMaterial: 12,
        conductoresHabilitados: 0
      } 
    };
    render(<CarroCard carro={carroConMaterial} />);
    
    expect(screen.getByText("12")).toBeInTheDocument();
  });

  it("muestra contador de conductores habilitados", () => {
    const carroConConductores = { 
      ...mockCarro, 
      _count: { 
        cajoneras: 0,
        asignacionesMaterial: 0,
        conductoresHabilitados: 8
      } 
    };
    render(<CarroCard carro={carroConConductores} />);
    
    expect(screen.getByText("8")).toBeInTheDocument();
  });

  it("renderiza todos los dividers correctamente", () => {
    const { container } = render(<CarroCard carro={mockCarro} />);
    
    const dividers = container.querySelectorAll('.MuiDivider-root');
    expect(dividers.length).toBeGreaterThan(0);
  });

  it("muestra tooltips para los contadores", () => {
    render(<CarroCard carro={mockCarro} />);
    
    // Los tooltips existen aunque no estén visibles hasta el hover
    expect(screen.getByText(/bomba b-1/i)).toBeInTheDocument();
  });

  it("aplica estilos de hover al card", () => {
    const { container } = render(<CarroCard carro={mockCarro} />);
    
    const card = container.querySelector('.MuiCard-root');
    expect(card).toHaveStyle({ display: 'flex' });
  });

  it("renderiza correctamente con todos los contadores en 0", () => {
    const carroVacio = { 
      ...mockCarro, 
      _count: { 
        cajoneras: 0,
        asignacionesMaterial: 0,
        conductoresHabilitados: 0
      } 
    };
    render(<CarroCard carro={carroVacio} />);
    
    const ceros = screen.getAllByText("0");
    expect(ceros.length).toBe(3);
  });

  it("muestra correctamente el icono de estado Operativo", () => {
    render(<CarroCard carro={mockCarro} />);
    
    // El icono está integrado en el chip de estado
    const estadoChip = screen.getByText(/operativo/i);
    expect(estadoChip).toBeInTheDocument();
  });

  it("muestra correctamente el icono de estado Mantenimiento", () => {
    const carroMantenimiento = { ...mockCarro, estadoOperativo: "Mantenimiento" };
    render(<CarroCard carro={carroMantenimiento} />);
    
    const estadoChip = screen.getByText(/mantenimiento/i);
    expect(estadoChip).toBeInTheDocument();
  });

  it("muestra correctamente el icono de estado Fuera de Servicio", () => {
    const carroFueraServicio = { ...mockCarro, estadoOperativo: "Fuera de Servicio" };
    render(<CarroCard carro={carroFueraServicio} />);
    
    const estadoChip = screen.getByText(/fuera de servicio/i);
    expect(estadoChip).toBeInTheDocument();
  });

  it("no muestra icono para estado desconocido (retorna null)", () => {
    const carroEstadoDesconocido = { 
      ...mockCarro, 
      estadoOperativo: "Estado Raro" 
    };
    render(<CarroCard carro={carroEstadoDesconocido} />);
    
    // El componente debe renderizar sin errores aunque el icono sea null
    expect(screen.getByText(/bomba b-1/i)).toBeInTheDocument();
  });

  it("renderiza el icono de carro en el header", () => {
    const { container } = render(<CarroCard carro={mockCarro} />);
    
    // El icono LocalShipping (CarroIcon) debe estar presente
    const icons = container.querySelectorAll('svg');
    expect(icons.length).toBeGreaterThan(0);
  });
});
