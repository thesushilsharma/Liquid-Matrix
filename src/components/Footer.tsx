import React from 'react';

export function Footer() {
  return (
    <footer className="w-full py-4 mt-8 border-t text-center text-sm text-muted-foreground bg-background">
      <span>&copy; {new Date().getFullYear()} Liquid Matrix. All rights reserved.</span>
      <span className="mx-2">|</span>
      <a
        href="https://github.com/thesushilsharma/Liquid-Matrix"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-primary mx-1"
      >
        GitHub
      </a>
      <span className="mx-1">·</span>
      <a
        href="https://linkedin.com/in/thesushilsharma"
        target="_blank"
        rel="noopener noreferrer"
        className="underline hover:text-primary mx-1"
      >
        LinkedIn
      </a>
    </footer>
  );
}