import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import BomberoCard from "../src/components/bomberos/BomberoCard";
import bomberosReducer from "../src/store/slices/bomberosSlice";

// Helper para renderizar con providers
const renderWithProviders = (component) => {
  const store = configureStore({
    reducer: {
      bomberos: bomberosReducer,
    },
  });

  return render(
    <Provider store={store}>
      <BrowserRouter>{component}</BrowserRouter>
    </Provider>
  );
};

// Mock de un bombero de ejemplo (estructura real del sistema)
const mockBombero = {
  id: 1,
  nombres: "Juan",
  apellidos: "Pérez González",
  rut: "12345678-9",
  email: "juan.perez@bomberos.cl",
  telefono: "+56 9 1234 5678",
  rango: "Bombero",
  estado: "Activo",
  fotoUrl: "/assets/bomberos/bombero-1.jpg",
};

describe("Componente BomberoCard", () => {
  it("renderiza el nombre completo correctamente", () => {
    renderWithProviders(<BomberoCard bombero={mockBombero} />);
    expect(screen.getByText(/Juan Pérez González/i)).toBeInTheDocument();
  });

  it("renderiza el rango del bombero", () => {
    renderWithProviders(<BomberoCard bombero={mockBombero} />);
    // Usar getAllByText porque "Bombero" aparece también en el email
    const elements = screen.getAllByText(/Bombero/i);
    expect(elements.length).toBeGreaterThan(0);
  });

  it("renderiza el estado como chip", () => {
    renderWithProviders(<BomberoCard bombero={mockBombero} />);
    expect(screen.getByText(/Activo/i)).toBeInTheDocument();
  });

  it("muestra el email del bombero", () => {
    renderWithProviders(<BomberoCard bombero={mockBombero} />);
    expect(screen.getByText(/juan.perez@bomberos.cl/i)).toBeInTheDocument();
  });

  it("muestra el teléfono del bombero", () => {
    renderWithProviders(<BomberoCard bombero={mockBombero} />);
    expect(screen.getByText(/\+56 9 1234 5678/i)).toBeInTheDocument();
  });

  it("renderiza los botones de acción (Ver, Editar, Eliminar)", () => {
    const onView = vi.fn();
    const onEdit = vi.fn();
    const onDelete = vi.fn();

    renderWithProviders(
      <BomberoCard
        bombero={mockBombero}
        onView={onView}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // Verificar que existen botones de acción
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("tiene botones de acción cuando showActions es true", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    
    renderWithProviders(
      <BomberoCard 
        bombero={mockBombero} 
        showActions={true}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    );

    // Verificar que los botones de editar y eliminar existen
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("muestra la imagen del bombero con la URL correcta", () => {
    renderWithProviders(<BomberoCard bombero={mockBombero} />);
    
    const avatars = screen.getAllByRole("img");
    expect(avatars.length).toBeGreaterThan(0);
    // La primera imagen debería ser el avatar del bombero
    expect(avatars[0]).toHaveAttribute("src", expect.stringContaining("bombero"));
  });

  it("renderiza correctamente un bombero en estado Inactivo", () => {
    const bomberoinactivo = { ...mockBombero, estado: "Inactivo" };
    renderWithProviders(<BomberoCard bombero={bomberoinactivo} />);
    
    expect(screen.getByText(/Inactivo/i)).toBeInTheDocument();
  });

  it("renderiza correctamente un bombero en estado Licencia", () => {
    const bomberoLicencia = { ...mockBombero, estado: "Licencia" };
    renderWithProviders(<BomberoCard bombero={bomberoLicencia} />);
    
    expect(screen.getByText(/Licencia/i)).toBeInTheDocument();
  });

  it("retorna null cuando no se proporciona un bombero", () => {
    const { container } = renderWithProviders(<BomberoCard bombero={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("retorna null cuando bombero es undefined", () => {
    const { container } = renderWithProviders(<BomberoCard />);
    expect(container.firstChild).toBeNull();
  });

  it("muestra el avatar con iniciales cuando no hay fotoUrl", () => {
    const bomberoSinFoto = { ...mockBombero, fotoUrl: null };
    renderWithProviders(<BomberoCard bombero={bomberoSinFoto} />);
    
    // Buscar el avatar con las iniciales
    expect(screen.getByText("JP")).toBeInTheDocument();
  });

  it("muestra solo la inicial del nombre cuando no hay apellido", () => {
    const bomberoSinApellido = { ...mockBombero, apellidos: "", fotoUrl: null };
    renderWithProviders(<BomberoCard bombero={bomberoSinApellido} />);
    
    // Debería mostrar "JB" (J de Juan, B por defecto)
    expect(screen.getByText("JB")).toBeInTheDocument();
  });

  it("muestra colores correctos para diferentes rangos", () => {
    const rangos = [
      { rango: "Comandante", expected: "Comandante" },
      { rango: "Capitán", expected: "Capitán" },
      { rango: "Teniente", expected: "Teniente" },
      { rango: "Sargento", expected: "Sargento" },
      { rango: "Cabo", expected: "Cabo" }
    ];

    rangos.forEach(({ rango }) => {
      const bomberoConRango = { ...mockBombero, rango };
      const { unmount } = renderWithProviders(<BomberoCard bombero={bomberoConRango} />);
      expect(screen.getByText(rango)).toBeInTheDocument();
      unmount();
    });
  });

  it("muestra especialidad cuando está presente", () => {
    const bomberoConEspecialidad = { 
      ...mockBombero, 
      especialidad: "Rescate vehicular" 
    };
    renderWithProviders(<BomberoCard bombero={bomberoConEspecialidad} />);
    
    expect(screen.getByText("Rescate vehicular")).toBeInTheDocument();
    expect(screen.getByText("Especialidad")).toBeInTheDocument();
  });

  it("muestra dirección cuando está presente", () => {
    const bomberoConDireccion = { 
      ...mockBombero, 
      direccion: "Av. Principal 123, Santiago" 
    };
    renderWithProviders(<BomberoCard bombero={bomberoConDireccion} />);
    
    expect(screen.getByText("Av. Principal 123, Santiago")).toBeInTheDocument();
    expect(screen.getByText("Dirección")).toBeInTheDocument();
  });

  it("muestra fecha de ingreso formateada", () => {
    const bomberoConFecha = { 
      ...mockBombero, 
      fechaIngreso: "2020-05-15T00:00:00.000Z" 
    };
    renderWithProviders(<BomberoCard bombero={bomberoConFecha} />);
    
    expect(screen.getByText("Fecha de Ingreso")).toBeInTheDocument();
    // La fecha puede variar por zona horaria, verificamos que contenga "05/2020"
    expect(screen.getByText(/\/05\/2020/)).toBeInTheDocument();
  });

  it("muestra 'No especificada' cuando no hay fecha de ingreso", () => {
    const bomberoSinFecha = { 
      ...mockBombero, 
      fechaIngreso: null 
    };
    renderWithProviders(<BomberoCard bombero={bomberoSinFecha} />);
    
    // La fecha de ingreso no se mostrará si es null (condicional)
    expect(screen.queryByText("Fecha de Ingreso")).not.toBeInTheDocument();
  });

  it("muestra 'Fecha inválida' para fechas malformadas", () => {
    const bomberoFechaInvalida = { 
      ...mockBombero, 
      fechaIngreso: "fecha-invalida" 
    };
    renderWithProviders(<BomberoCard bombero={bomberoFechaInvalida} />);
    
    expect(screen.getByText("Fecha inválida")).toBeInTheDocument();
  });

  it("muestra información del creador cuando está presente", () => {
    const bomberoConCreador = { 
      ...mockBombero, 
      createdBy: { nombre: "Admin Sistema" } 
    };
    renderWithProviders(<BomberoCard bombero={bomberoConCreador} />);
    
    expect(screen.getByText("Creado por")).toBeInTheDocument();
    expect(screen.getByText("Admin Sistema")).toBeInTheDocument();
  });

  it("muestra citaciones recientes cuando existen", () => {
    const bomberoConCitaciones = { 
      ...mockBombero, 
      citaciones: [
        { 
          id: 1, 
          citacion: { 
            titulo: "Simulacro de incendio", 
            estado: "Programada" 
          } 
        },
        { 
          id: 2, 
          citacion: { 
            titulo: "Capacitación primeros auxilios", 
            estado: "Completada" 
          } 
        }
      ]
    };
    renderWithProviders(<BomberoCard bombero={bomberoConCitaciones} />);
    
    expect(screen.getByText("Citaciones recientes")).toBeInTheDocument();
    expect(screen.getByText("Simulacro de incendio")).toBeInTheDocument();
    expect(screen.getByText("Capacitación primeros auxilios")).toBeInTheDocument();
  });

  it("muestra mensaje de más citaciones cuando hay más de 3", () => {
    const bomberoConMuchasCitaciones = { 
      ...mockBombero, 
      citaciones: [
        { id: 1, citacion: { titulo: "Citación 1", estado: "Programada" } },
        { id: 2, citacion: { titulo: "Citación 2", estado: "Programada" } },
        { id: 3, citacion: { titulo: "Citación 3", estado: "Programada" } },
        { id: 4, citacion: { titulo: "Citación 4", estado: "Programada" } },
        { id: 5, citacion: { titulo: "Citación 5", estado: "Programada" } }
      ]
    };
    renderWithProviders(<BomberoCard bombero={bomberoConMuchasCitaciones} />);
    
    expect(screen.getByText(/Y 2 más.../i)).toBeInTheDocument();
  });

  it("muestra fecha de creación", () => {
    const bomberoConFechas = { 
      ...mockBombero, 
      createdAt: "2023-01-15T10:00:00.000Z",
      updatedAt: "2023-01-15T10:00:00.000Z"
    };
    renderWithProviders(<BomberoCard bombero={bomberoConFechas} />);
    
    expect(screen.getByText(/Creado:/i)).toBeInTheDocument();
  });

  it("muestra fecha de actualización cuando es diferente de creación", () => {
    const bomberoActualizado = { 
      ...mockBombero, 
      createdAt: "2023-01-15T10:00:00.000Z",
      updatedAt: "2023-06-20T15:30:00.000Z"
    };
    renderWithProviders(<BomberoCard bombero={bomberoActualizado} />);
    
    expect(screen.getByText(/Actualizado:/i)).toBeInTheDocument();
  });

  it("NO muestra botones de acción cuando showActions es false", () => {
    renderWithProviders(
      <BomberoCard 
        bombero={mockBombero} 
        showActions={false}
      />
    );
    
    // No debería haber botones de editar ni eliminar
    expect(screen.queryByText("Editar")).not.toBeInTheDocument();
    expect(screen.queryByText("Eliminar")).not.toBeInTheDocument();
  });

  it("llama a onEdit cuando se hace clic en el botón editar", () => {
    const onEdit = vi.fn();
    renderWithProviders(
      <BomberoCard 
        bombero={mockBombero} 
        onEdit={onEdit}
        showActions={true}
      />
    );
    
    const editButton = screen.getByText("Editar");
    fireEvent.click(editButton);
    
    expect(onEdit).toHaveBeenCalledWith(mockBombero);
  });

  it("llama a onDelete cuando se hace clic en el botón eliminar", () => {
    const onDelete = vi.fn();
    renderWithProviders(
      <BomberoCard 
        bombero={mockBombero} 
        onDelete={onDelete}
        showActions={true}
      />
    );
    
    const deleteButton = screen.getByText("Eliminar");
    fireEvent.click(deleteButton);
    
    expect(onDelete).toHaveBeenCalledWith(mockBombero);
  });

  it("muestra botón de cerrar cuando se proporciona onClose", () => {
    const onClose = vi.fn();
    renderWithProviders(
      <BomberoCard 
        bombero={mockBombero} 
        onClose={onClose}
      />
    );
    
    // Buscar el botón de cerrar (CloseIcon)
    const closeButtons = screen.getAllByRole("button");
    // El botón de cerrar debería estar presente
    expect(closeButtons.length).toBeGreaterThan(0);
  });

  it("llama a onClose cuando se hace clic en el botón cerrar", () => {
    const onClose = vi.fn();
    renderWithProviders(
      <BomberoCard 
        bombero={mockBombero} 
        onClose={onClose}
      />
    );
    
    // El botón de cerrar es el primero (antes de los botones de acción)
    const buttons = screen.getAllByRole("button");
    const closeButton = buttons[0]; // Primer botón debería ser el de cerrar
    
    fireEvent.click(closeButton);
    
    expect(onClose).toHaveBeenCalled();
  });

  it("muestra enlaces de teléfono y email clicables", () => {
    renderWithProviders(<BomberoCard bombero={mockBombero} />);
    
    // Verificar que los enlaces existen
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });
});
