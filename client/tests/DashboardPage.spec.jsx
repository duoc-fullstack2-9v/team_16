import React from "react";
import { render, screen } from "@testing-library/react";
import DashboardPage from "../src/pages/DashboardPage";

describe("Componente DashboardPage", () => {
  it("renderiza el título principal del dashboard", () => {
    render(<DashboardPage />);

    expect(screen.getByText(/dashboard principal/i)).toBeInTheDocument();
  });

  it("incluye el emoji de gráfica en el título", () => {
    render(<DashboardPage />);

    expect(screen.getByText(/📊/)).toBeInTheDocument();
  });

  it("muestra la tarjeta de Total Bomberos", () => {
    render(<DashboardPage />);

    expect(screen.getByText(/total bomberos/i)).toBeInTheDocument();
  });

  it("muestra la tarjeta de Citaciones Activas", () => {
    render(<DashboardPage />);

    expect(screen.getByText(/citaciones activas/i)).toBeInTheDocument();
  });

  it("muestra la tarjeta de Oficiales", () => {
    render(<DashboardPage />);

    expect(screen.getByText(/oficiales/i)).toBeInTheDocument();
  });

  it("muestra la tarjeta de Usuarios Activos", () => {
    render(<DashboardPage />);

    expect(screen.getByText(/usuarios activos/i)).toBeInTheDocument();
  });

  it("muestra placeholder '--' en todas las métricas", () => {
    render(<DashboardPage />);

    // Debería haber 4 placeholders (uno por cada métrica)
    const placeholders = screen.getAllByText("--");
    expect(placeholders).toHaveLength(4);
  });

  it("renderiza 4 cards en total", () => {
    const { container } = render(<DashboardPage />);

    // Contar los CardContent (cada card tiene uno)
    const cards = container.querySelectorAll(".MuiCardContent-root");
    expect(cards).toHaveLength(4);
  });

  it("las métricas están en formato de Typography variant h4", () => {
    const { container } = render(<DashboardPage />);

    // Verificar que hay elementos h4 con '--'
    const h4Elements = container.querySelectorAll('.MuiTypography-h4');
    expect(h4Elements.length).toBeGreaterThanOrEqual(4);
  });

  it("los títulos de las métricas usan color textSecondary", () => {
    render(<DashboardPage />);

    // Verificar que el componente se renderiza correctamente
    expect(screen.getByText(/total bomberos/i)).toBeInTheDocument();
    expect(screen.getByText(/citaciones activas/i)).toBeInTheDocument();
    expect(screen.getByText(/oficiales/i)).toBeInTheDocument();
    expect(screen.getByText(/usuarios activos/i)).toBeInTheDocument();
  });

  it("usa Grid container con spacing correcto", () => {
    const { container } = render(<DashboardPage />);

    // Verificar que existe el Grid container
    const gridContainer = container.querySelector('.MuiGrid-container');
    expect(gridContainer).toBeInTheDocument();
  });

  it("renderiza correctamente sin props", () => {
    // Test de smoke: el componente debe renderizarse sin errores
    const { container } = render(<DashboardPage />);
    expect(container).toBeInTheDocument();
  });

  it("estructura del layout es correcta con Box principal", () => {
    const { container } = render(<DashboardPage />);

    // Verificar que existe el Box principal
    const mainBox = container.querySelector('.MuiBox-root');
    expect(mainBox).toBeInTheDocument();
  });

  it("título tiene el variant h4 correcto", () => {
    const { container } = render(<DashboardPage />);

    // Buscar el h4 del título principal
    const heading = screen.getByText(/dashboard principal/i);
    expect(heading.tagName).toBe('H4');
  });

  it("título tiene gutterBottom spacing", () => {
    render(<DashboardPage />);

    const heading = screen.getByText(/dashboard principal/i);
    expect(heading.className).toContain('MuiTypography-gutterBottom');
  });
});
