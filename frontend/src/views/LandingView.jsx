import "./LandingView.css";
import gymImg1 from "../assets/gym1.jpg";
import gymImg2 from "../assets/gym2.jpeg";

function LandingView() {
  return (
    <main className="landing">
      <section className="row">
        <div className="col image">
          <img src={gymImg1} alt="Trening" />
        </div>
        <div className="col text wide">
          <h3 className="highlight">Umorni od bolova u leđima i zglobovima?</h3>
          <p className="accent">
            Dugi sati sjedenja i uredski posao iscrpljuju tijelo?
          </p>
          <p className="accent">
            Potrebna je motivacija i jasan plan treninga kako bi se pokrenuli i
            održali formu?
          </p>
          <p className="accent">Želite poraditi na držanju!</p>
          <p className="accent">Što je sa zdravljem i prehranom?</p>

          <p className="story">
            <strong>Ja Vam mogu pomoć.</strong> Svi ovi izazovi su mi dobro
            poznati i najviše sam učila kroz vlastito iskustvo. Svakoga očekuje{" "}
            <span className="emphasis">individualni plan</span>, savjeti uz
            prehranu i ono što me čini drugačijom ➡️
            <span className="emphasis">
              hrpa vježbi za mobilnost i opuštanje!
            </span>
          </p>
        </div>
      </section>

      <section className="row reverse">
        <div className="col image">
          <img src={gymImg2} alt="Online platforma" />
        </div>
        <div className="col text wide">
          <div className="col text wide">
            <h3 className="highlight">Što dobivate uz Do&BEFitness?</h3>

            <p className="check-line">
              Pristup vlastitoj stranici gdje se vježbe ažuriraju
              <span className="emphasis">na tjednoj bazi</span>;
            </p>
            <p className="check-line">
              3 full‑body ili 4 treninga (2 gornji dio + 2 donji dio)
              <span className="emphasis">ovisno o preferencijama</span>;
            </p>
            <p className="check-line">
              Praćenje napretka i analiza - tjelesna težina, napredak za svaku
              vježbu,<span className="emphasis">sve vizualizirano</span>;
            </p>
            <p className="check-line">
              Savjeti vezani za prehranu + prijedlozi
              <span className="emphasis">osobnih recepata</span>
            </p>

            <p className="story">
              <strong>Zainteresirani?</strong> Registrirajte se već danas. Nakon
              prijave šaljem inicijalni upitnik, a dalje se dogovaramo oko
              detalja putem e‑maila. Za sva pitanja uvijek sam dostupna, a tu je
              i<span className="emphasis"> Viber grupa </span> kojoj se
              pridružuju svi klijenti - namijenjena razmjeni iskustava i
              međusobnoj podršci.
            </p>
          </div>
        </div>
      </section>

      <section className="reviews">
        <h3>Što kažu naši korisnici</h3>
        <div className="review-grid">
          <blockquote>
            “Dorotea mi je pomogla da napokon pronađem rutinu koja mi odgovara.”
          </blockquote>
          <blockquote>
            “Planovi su jasni, motivacija ogromna — osjećam se bolje nego ikad.”
          </blockquote>
          <blockquote>
            “Najbolja odluka bila je krenuti s Do&BEFitness. Rezultati su tu!”
          </blockquote>
        </div>
      </section>
    </main>
  );
}

export default LandingView;
