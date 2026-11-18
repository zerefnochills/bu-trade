import React from 'react';
import { render, screen } from '@testing-library/react';
import RulesPage from '@/app/rules/page';
import SafetyPage from '@/app/safety/page';

describe('Campus Safety & Community Rules Page', () => {
  it('renders Bennett University safety headings and standards', () => {
    render(<RulesPage />);
    expect(screen.getByText(/Campus Safety & Community Rules/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Bennett University/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders all three designated campus safe exchange zones', () => {
    render(<RulesPage />);
    expect(screen.getByText(/Food Court & Cafeteria/i)).toBeInTheDocument();
    expect(screen.getByText(/Central Library Ground Floor Lobby/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Main Gate Security Desk/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders daytime transaction requirements and inspection etiquette', () => {
    render(<RulesPage />);
    expect(screen.getAllByText(/9:00 AM/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Inspect Before Handover/i)).toBeInTheDocument();
    expect(screen.getAllByText(/UPI or Cash/i).length).toBeGreaterThanOrEqual(1);
  });

  it('renders prohibited goods list adhering to Bennett campus regulations', () => {
    render(<RulesPage />);
    expect(screen.getByText(/Alcohol, Tobacco & Vapes/i)).toBeInTheDocument();
    expect(screen.getByText(/Drugs & Controlled Substances/i)).toBeInTheDocument();
    expect(screen.getByText(/Weapons & Hazardous Items/i)).toBeInTheDocument();
    expect(screen.getByText(/Exam Materials/i)).toBeInTheDocument();
    expect(screen.getByText(/University & Stolen Property/i)).toBeInTheDocument();
  });

  it('renders the same guidelines through the /safety page export', () => {
    render(<SafetyPage />);
    expect(screen.getByText(/Campus Safety & Community Rules/i)).toBeInTheDocument();
  });
});
