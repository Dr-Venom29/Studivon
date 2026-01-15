import React, { useEffect, useState } from 'react';

const phrases = [
  'SYSTEM CAPABILITIES',
  'OPERATIONAL FEATURES',
  'WHAT STUDIVON DOES',
];

const TerminalTyping = () => {
  const [text, setText] = useState('');
  const [index, setIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const current = phrases[index];
    const speed = isDeleting ? 40 : 80;

    const timeout = setTimeout(() => {
      if (!isDeleting) {
        const next = current.slice(0, text.length + 1);
        setText(next);

        if (next === current) {
          setTimeout(() => setIsDeleting(true), 800);
        }
      } else {
        const next = current.slice(0, text.length - 1);
        setText(next);

        if (next === '') {
          setIsDeleting(false);
          setIndex((prev) => (prev + 1) % phrases.length);
        }
      }
    }, speed);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, index]);

  return (
    <h2 className="terminal-title">
      <span className="prompt">&gt;_</span>
      <span className="typed-text">{text}</span>
    </h2>
  );
};

export default TerminalTyping;
