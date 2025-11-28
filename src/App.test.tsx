import { describe, it, expect } from 'vitest';
import { render } from './test/test-utils';
import App from './App';

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    // App should render the CorkBoard component
    expect(document.querySelector('.w-screen')).toBeTruthy();
  });
});
