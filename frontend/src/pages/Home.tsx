import { Link } from "react-router-dom";
import "./Home.css";

const heroImage = "/head.jpg";

const millImage =
  "https://rajapalayammills.co.in/wp-content/uploads/2017/04/banner7.jpg";

const machineryImage =
  "https://rajapalayammills.co.in/wp-content/uploads/2017/04/banner5.jpg";

const yarnImage =
  "https://rajapalayammills.co.in/wp-content/uploads/2017/04/banner12.jpg";

const qualityImage =
  "https://rajapalayammills.co.in/wp-content/uploads/2017/04/banner10.jpg";

function Home() {
  return (
    <main className="home-page">

      {/* NAVBAR */}
      <header className="main-nav">
        <Link to="/" className="logo">
          <div className="logo-mark">RM</div>

          <div className="logo-text">
            <strong>RAJAPALAYAM MILLS</strong>
            <span>RECRUITMENT • TALENT • OPPORTUNITY</span>
          </div>
        </Link>

        <nav>
          <a href="#company">Experience</a>
          <a href="#journey">Journey</a>
          <a href="#opportunities">Careers</a>
          <a href="#technology">AI Platform</a>
        </nav>

        <Link to="/round-one" className="nav-button">
          Candidate Login
          <span>↗</span>
        </Link>
      </header>


      {/* HERO */}
      <section className="new-hero">

        {/* ORIGINAL IMAGE */}
        <div
          className="hero-building"
          style={{
            backgroundImage: `url(${heroImage})`,
          }}
        />

        {/* DARKNESS ONLY — IMAGE QUALITY NOT CHANGED */}
        <div className="hero-dark" />

        <div className="hero-bottom-glow" />


        {/* WIND / LEAVES */}
        <div className="leaf-field">

          <span className="leaf l1" />
          <span className="leaf l2" />
          <span className="leaf l3" />
          <span className="leaf l4" />
          <span className="leaf l5" />
          <span className="leaf l6" />
          <span className="leaf l7" />
          <span className="leaf l8" />
          <span className="leaf l9" />
          <span className="leaf l10" />
          <span className="leaf l11" />
          <span className="leaf l12" />
          <span className="leaf l13" />
          <span className="leaf l14" />
          <span className="leaf l15" />

        </div>


        {/* SUBTLE GOLD ORBIT */}
        <div className="thread thread-a" />
        <div className="thread thread-b" />
        <div className="thread thread-c" />


        {/* HERO CONTENT */}
        <div className="hero-main">

          <div className="hero-kicker">
            RAJAPALAYAM MILLS LIMITED
            <span />
            SINCE 1936
          </div>

          <h1>
            YOUR NEXT
            <br />

            <span className="outline-text">
              CHAPTER
            </span>

            <br />

            STARTS HERE.
          </h1>

          <p>
            A smarter recruitment experience built for people,
            powered by AI, and designed around the way
            Rajapalayam Mills works.
          </p>

          <div className="hero-buttons">

            <Link
              to="/round-one"
              className="gold-button"
            >
              Start Your Application
              <span>↗</span>
            </Link>

            <a
              href="#company"
              className="explore-button"
            >
              Explore the experience
              <span>↓</span>
            </a>

          </div>

        </div>


        {/* SIDE YEAR */}
        <div className="hero-side">

          <span>EST.</span>

          <strong>1936</strong>

          <small>
            ROOTED IN
            <br />
            INDUSTRY
          </small>

        </div>


        {/* HERO BOTTOM */}
        <div className="hero-bottom">

          <span>
            AI-POWERED RECRUITMENT EXPERIENCE
          </span>

          <span>
            SCROLL TO EXPLORE ↓
          </span>

        </div>

      </section>


      {/* COMPANY */}
      <section
        id="company"
        className="company-section"
      >

        <div className="section-number">
          01
        </div>

        <div className="company-heading">

          <span>THE COMPANY</span>

          <h2>
            WHERE INDUSTRY
            <br />
            MEETS <i>PEOPLE.</i>
          </h2>

        </div>


        <div className="company-grid">

          <div className="company-image-wrap">

            <div
              className="company-image"
              style={{
                backgroundImage: `url(${millImage})`,
              }}
            />

            <div className="image-tag">
              RAJAPALAYAM MILLS
            </div>

          </div>


          <div className="company-copy">

            <p className="large-copy">
              A recruitment experience designed around a
              real industrial environment — where people,
              precision and technology work together.
            </p>

            <p>
              Rajapalayam Mills has a long-standing presence
              in textile manufacturing. This platform brings
              that industrial identity into a modern digital
              recruitment journey.
            </p>


            <div className="company-stat">

              <strong>1936</strong>

              <span>
                COMPANY
                <br />
                ROOTS
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* OPPORTUNITIES */}
      <section
        id="opportunities"
        className="opportunity-section"
      >

        <div className="section-top">

          <div>

            <span>
              02 / OPPORTUNITIES
            </span>

            <h2>
              FIND YOUR
              <br />
              <i>PLACE.</i>
            </h2>

          </div>

          <p>
            Whether you are starting your career or bringing
            years of experience, begin your journey here.
          </p>

        </div>


        <div className="opportunity-grid">

          <Link
            to="/round-one"
            className="opportunity-card"
          >

            <div
              className="opportunity-image"
              style={{
                backgroundImage: `url(${machineryImage})`,
              }}
            />

            <div className="opportunity-overlay" />

            <div className="card-number">
              01
            </div>

            <div className="opportunity-content">

              <span>
                FOR EXPERIENCED TALENT
              </span>

              <h3>
                Experienced
                <br />
                Professional
              </h3>

              <p>
                Bring your knowledge, experience and
                perspective to your next opportunity.
              </p>

              <strong>
                Continue
                <b>↗</b>
              </strong>

            </div>

          </Link>


          <Link
            to="/round-one"
            className="opportunity-card"
          >

            <div
              className="opportunity-image"
              style={{
                backgroundImage: `url(${yarnImage})`,
              }}
            />

            <div className="opportunity-overlay" />

            <div className="card-number">
              02
            </div>

            <div className="opportunity-content">

              <span>
                FOR NEW TALENT
              </span>

              <h3>
                Early Career
                <br />
                Opportunity
              </h3>

              <p>
                Start strong, learn continuously and
                grow with an industry built on expertise.
              </p>

              <strong>
                Continue
                <b>↗</b>
              </strong>

            </div>

          </Link>

        </div>

      </section>


      {/* JOURNEY */}
      <section
        id="journey"
        className="journey-section"
      >

        <div className="section-number">
          03
        </div>

        <div className="journey-heading">

          <span>
            YOUR JOURNEY
          </span>

          <h2>
            FROM APPLICATION
            <br />
            TO <i>OPPORTUNITY.</i>
          </h2>

        </div>


        <div className="journey-line">

          <div className="journey-step">
            <b>01</b>
            <span>APPLY</span>
            <p>
              Enter your details and select
              your career path.
            </p>
          </div>

          <div className="journey-step">
            <b>02</b>
            <span>BASIC ROUND</span>
            <p>
              AI-assisted questions through
              text and voice.
            </p>
          </div>

          <div className="journey-step">
            <b>03</b>
            <span>DOMAIN ROUND</span>
            <p>
              Questions based on your
              selected domain.
            </p>
          </div>

          <div className="journey-step">
            <b>04</b>
            <span>AI EVALUATION</span>
            <p>
              Responses evaluated using
              company-defined criteria.
            </p>
          </div>

          <div className="journey-step">
            <b>05</b>
            <span>HR REVIEW</span>
            <p>
              Structured information and
              interview insights for HR.
            </p>
          </div>

        </div>

      </section>


      {/* TECHNOLOGY */}
      <section
        id="technology"
        className="technology-section"
      >

        <div
          className="technology-image"
          style={{
            backgroundImage: `url(${qualityImage})`,
          }}
        />

        <div className="technology-overlay" />

        <div className="technology-content">

          <span>
            04 / AI RECRUITMENT
          </span>

          <h2>
            TECHNOLOGY
            <br />
            <i>BEHIND PEOPLE.</i>
          </h2>

          <p>
            Candidates can interact naturally through
            voice or text. Speech is converted into text,
            AI understands the response, and structured
            information moves into the recruitment workflow.
          </p>


          <div className="technology-points">

            <div>
              <strong>01</strong>
              <span>VOICE INPUT</span>
            </div>

            <div>
              <strong>02</strong>
              <span>LANGUAGE UNDERSTANDING</span>
            </div>

            <div>
              <strong>03</strong>
              <span>STRUCTURED INSIGHT</span>
            </div>

          </div>

        </div>

      </section>


      {/* FINAL CTA */}
      <section className="final-section">

        <div className="final-orbit" />

        <span>
          RAJAPALAYAM MILLS • CAREERS
        </span>

        <h2>
          YOUR NEXT
          <br />
          <i>CHAPTER</i>
          <br />
          STARTS HERE.
        </h2>

        <Link
          to="/round-one"
          className="gold-button"
        >
          Start Your Application
          <span>↗</span>
        </Link>

      </section>


      {/* FOOTER */}
      <footer className="site-footer">

        <div>
          <strong>
            RAJAPALAYAM MILLS
          </strong>

          <span>
            AI-POWERED RECRUITMENT PLATFORM
          </span>
        </div>

        <div>
          © Rajapalayam Mills Limited
        </div>

        <div>
          PEOPLE • TECHNOLOGY • PROGRESS
        </div>

      </footer>

    </main>
  );
}

export default Home;