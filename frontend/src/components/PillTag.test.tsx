import React from 'react';
import { render, screen } from '@testing-library/react';
import PillTag from './PillTag';
import { StaticRouter } from 'react-router-dom';

test('renders pill tag', () => {
  render(
    <StaticRouter>
      <PillTag bgColor="#000000" fontColor="#ffffff" tag="Hello" />
    </StaticRouter>
  );
  const linkElement = screen.getByText(/Hello/);
  expect(linkElement).toBeInTheDocument();
});
