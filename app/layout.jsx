import '../src/styles.css';

export const metadata = {
  title: 'Dukie',
  description: 'Seu organizador pessoal de séries',
};

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
