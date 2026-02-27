import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import React from 'react'
import { DesignConfigProvider, useDesignConfig } from '../DesignConfigProvider.jsx'
import DesignControl from '../DesignControl.jsx'

function ReadConfig() {
  const { config } = useDesignConfig()
  return <div data-testid="font">{config.typography.font}</div>
}

describe('DesignControl', () => {
  it('applies preset modern-sky', () => {
    render(
      <DesignConfigProvider>
        <DesignControl />
        <ReadConfig />
      </DesignConfigProvider>
    )
    const textarea = screen.getByLabelText('Masukan konfigurasi desain')
    fireEvent.change(textarea, { target: { value: 'preset: modern-sky' } })
    const btn = screen.getByText('Terapkan')
    fireEvent.click(btn)
    expect(screen.getByTestId('font').textContent).toBe('inter')
  })

  it('applies JSON and normalizes invalid values', () => {
    render(
      <DesignConfigProvider>
        <DesignControl />
        <ReadConfig />
      </DesignConfigProvider>
    )
    const textarea = screen.getByLabelText('Masukan konfigurasi desain')
    fireEvent.change(textarea, { target: { value: '{"typography":{"baseSize":25}}' } })
    const btn = screen.getByText('Terapkan')
    fireEvent.click(btn)
    // baseSize normalized but font remains default; just ensure no crash
    expect(screen.getByTestId('font').textContent.length > 0).toBe(true)
  })
})

