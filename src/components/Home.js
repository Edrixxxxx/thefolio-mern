import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <main className="container">
      <section className="hero">
        <div className="hero-text">
          <h1>Design, Learn, and Share — My Web Craft Journey</h1>
          <h3>Hi!, I'm Edrich Josh Mabalot</h3>
          <p>
            I build simple, clear websites and enjoy sharing what I learn. This portfolio presents highlights of my interests in front-end web design, accessible structure, and responsive layouts. Explore projects, background, and ways to sign up for updates.
          </p>
          <Link className="cta" to="/about">Learn More About Me</Link>
        </div>

        <figure className="hero-image" aria-hidden="false">
          <div className="profile-circle" role="img" aria-label="Profile photo">
            <img src="/me.jpg" />
          </div>
        </figure>
      </section>

      <section className="previews">
        <article className="preview-card">
          <h2>What I Love About Web Design</h2>
          <p>Clean typography, meaningful layout, and purposeful color choices make content easier to use. I prioritize clarity in every page I design.</p>
          <Link to="/about">Read more →</Link>
        </article>

        <article className="preview-card">
          <h2>Resources & Contact</h2>
          <p>I gather trusted learning resources and tools. If you'd like to collaborate or ask a question, use the Contact page form to get in touch.</p>
          <Link to="/contact">Contact →</Link>
        </article>

        <article className="preview-card">
          <h2>Sign Up for Updates</h2>
          <p>Join a small list of learners to receive updates and short tips about web craft and front-end techniques.</p>
          <Link to="/register">Sign up →</Link>
        </article>
      </section>

      <aside className="highlights">
        <h3>Key Highlights</h3>
        <ul>
          <li>Responsive layouts built with CSS Grid and Flexbox</li>
          <li>Accessible semantic HTML and clear navigation</li>
          <li>Consistent visual design with a readable typography system</li>
        </ul>
      </aside>
    </main>
  );
};

export default Home;