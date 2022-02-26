import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Deck.css';
import Card from './Card';

const DECK_API = 'http://deckofcardsapi.com/api/deck/';

const Deck = () => {
  const [deck, setDeck] = useState(null);
  const [drawn, setDrawn] = useState([]);
  const [autoDraw, setAutoDraw] = useState(false);
  const timerRef = useRef(null)

  useEffect(() => {
    async function getRes () {
      let res = await axios.get(`${DECK_API}/new/shuffle/`);
      setDeck(res.data);
    }
    getRes();
  }, [setDeck]);

  useEffect(() => {
    async function getCard () {
      let { deck_id } = deck;

      try {

        let cardRes = await axios.get(`${DECK_API}/${deck_id}/draw/`);

        if (cardRes.data.remaining === 0) {
          setAutoDraw(false);
          throw new Error('no cards remaining!')
        }
        const card = cardRes.data.cards[0];

        setDrawn(drawn => [...drawn, {
          id: card.code,
          name: card.suit + ' ' + card.value,
          image: card.image
        }
        ]);
      } catch (error) {
        alert(error);
      }
    }

    if (autoDraw && !timerRef.current) {
      timerRef.current = setInterval(async () => {
        await getCard();
      }, 1000);
    }

    return () => {
      clearInterval(timerRef.current);
      timerRef.current = null;
    };
  }, [autoDraw, setAutoDraw, deck]);

  const toggleDraw = () => {
    setAutoDraw(auto => !auto);
  };

  const cards = drawn.map(card => (
    <Card name={ card.name } image={ card.image } key={ card.id } />
  ));


  return (
    <div className='Deck'>
      { deck ? (
        <button
          className='DeckBtn'
          onClick={ toggleDraw }
        >
          { autoDraw ? 'STOP ' : 'CONTINUE ' }
          DRAWING CARDS
        </button>) : null }
      <div className='DeckCards'>{ cards }</div>
    </div>
  )
}

export default Deck;