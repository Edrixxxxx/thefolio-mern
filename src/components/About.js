import React from 'react';
import { Link } from 'react-router-dom';

const About = () => {
  return (
    <main className="container">
      <section className="content-section">
        <h1>What I Love About Web Design</h1>
        <p>
          Ever since I first rearranged a personal blog's layout, I've loved how small choices in spacing, color, and typographic scale change the experience of reading. Clear structure reduces confusion and makes information faster to find. I prefer subtle, intentional visuals that support content rather than distract from it. This portfolio focuses on fundamentals—semantics, responsive layout, and accessible controls—that help people use the web with less friction.
        </p>
        <div className="about-images">
          <figure>
            <img src="/eee.jpg" alt="Laptop and notebook with design sketches" />
          </figure>
          <figure>
            <img src="/aaa.jpg" alt="Code editor on screen with CSS and HTML" />
          </figure>
        </div>
      </section>

      <h2>External Links Recommended</h2>
      <table className="resources" summary="Helpful resources for learning web development">
        <thead>
          <tr>
            <th>Games</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><a href="https://www.chess.com/" target="_blank" rel="noopener noreferrer">Chess.com</a></td>
            <td>Play Chess Online on the #1 Site!.</td>
          </tr>
          <td><Link to="/tetris">Tetris</Link></td>
          <td>Play Tetris offline!</td>
        </tbody>
      </table>

      <section className="content-section">
        <h2>My Journey</h2>
        <p>
          My learning path began with tutorials and small projects, moving on to rebuilding simple sites with proper structure and responsive behavior. Over time I focused on accessibility, semantic markup, and performance improvements. Practical projects included building landing pages, forms, and a small documentation site that emphasized readability and a predictable layout.
        </p>

        <ol className="timeline">
          <li>Year 1 — Basics from Many programming language</li>
          <li>Year 2 — Learning database</li>
          <li>Year 3 — Start to complete portfolio.</li>
        </ol>

        <blockquote>
          "Good design is as little design as possible." — A guiding idea I apply when crafting interfaces.
        </blockquote>
      </section>
    </main>
  );
};

export default About;