import React, { useState, useMemo } from 'react';
import slugify from 'slugify';

import { createRoom, updateApiQuery } from '../logic/backend';
import { currentId } from '../logic/identity';
import { navigate } from '../lib/use-location';
import { enterRoom } from '../logic/main';
import Container from './Container';
import { is } from 'use-minimal-state';
import state from '../logic/state';
import Icon from '../icons/icon'
import Crap from '../icons/crap'

export default function Start({ urlRoomId, roomFromURIError }) {
  let [name, setName] = useState('');
  let [description, setDescription] = useState('');
  let [color, setColor] = useState('#4F46E5');
  let [logoURI, setLogoURI] = useState('');
  let [buttonText, setButtonText] = useState('');
  let [buttonURI, setButtonURI] = useState('');

  const [showAdvanced, setShowAdvanced] = useState(false);

  let submit = e => {
    e.preventDefault();
    is(state, 'userInteracted', true);
    let roomId;
    if (name) {
      let slug = slugify(name, { lower: true, strict: true });
      roomId = slug + '-' + Math.random().toString(36).substr(2, 4);
    } else {
      roomId = Math.random().toString(36).substr(2, 6);
    }

    (async () => {
      let roomCreated = await createRoom(
        roomId,
        name,
        description,
        logoURI,
        color,
        currentId()
      );
      if (roomCreated) {
        updateApiQuery(`/rooms/${roomId}`, roomCreated, 200);
        if (urlRoomId !== roomId) navigate('/' + roomId);
        enterRoom(roomId);
      }
    })();
  };

  let humins = useMemo(() => {
    let humins = ['DoubleMalt', 'mitschabaude', '__tosh'];
    return humins.sort(() => Math.random() - 0.5);
  }, []);

  return (
    <div className="container mx-auto">
      <div className="grid lg:grid-cols-2 md:gird-cols-2">
        <div className="grid gap-6 content-center">
          <Icon></Icon>
          <Crap></Crap>
          <h1 className="text-lg text-white">Craphouse is an audio space for chatting, brainstorming, debating, or any crap you want to talk about.</h1>
          <form className="pt-6" onSubmit={submit}>
            <div className="hidden">
              <input
                className="rounded placeholder-gray-400 bg-gray-50 w-full md:w-96"
                type="text"
                placeholder="Room topic"
                value={name}
                name="jam-room-topic"
                autoComplete="off"
                onChange={e => {
                  setName(e.target.value);
                }}
              ></input>
              <div className="p-2 text-gray-500 italic">
                Pick a topic to talk about.{' '}
                <span className="text-gray-400">(optional)</span>
              </div>
              <br />
              <textarea
                className="rounded placeholder-gray-400 bg-gray-50 w-full md:w-full"
                placeholder="Room description"
                value={description}
                name="jam-room-description"
                autoComplete="off"
                rows="2"
                onChange={e => {
                  setDescription(e.target.value);
                }}
              ></textarea>
              <div className="p-2 text-gray-500 italic">
                Describe what this room is about.{' '}
                <span className="text-gray-400">
                  (optional) (supports{' '}
                  <a
                    className="underline"
                    href="https://guides.github.com/pdfs/markdown-cheatsheet-online.pdf"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Markdown
                </a>
                )
              </span>{' '}
                <span onClick={() => setShowAdvanced(!showAdvanced)}>
                  {/* heroicons/gift */}
                  <svg
                    style={{ cursor: 'pointer' }}
                    className="pb-1 h-5 w-5 inline-block"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                    />
                  </svg>
                </span>
              </div>
            </div>

            {/* advanced Room options */}
            <div className={showAdvanced ? '' : 'hidden'}>
              <br />
              <input
                className="rounded placeholder-gray-400 bg-gray-50 w-full md:w-full"
                type="text"
                placeholder="Logo URI"
                value={logoURI}
                name="jam-room-logo-uri"
                autoComplete="off"
                onChange={e => {
                  setLogoURI(e.target.value);
                }}
              ></input>
              <div className="p-2 text-gray-500 italic">
                Set the URI for your logo.{' '}
                <span className="text-gray-400">(optional)</span>
              </div>

              <br />
              <input
                className="rounded w-44 h-12"
                type="color"
                value={color}
                name="jam-room-color"
                autoComplete="off"
                onChange={e => {
                  setColor(e.target.value);
                }}
              ></input>
              <div className="p-2 text-gray-500 italic">
                Set primary color for your Room.{' '}
                <span className="text-gray-400">(optional)</span>
              </div>

              <br />
              <input
                className="rounded placeholder-gray-400 bg-gray-50 w-full md:w-full"
                type="text"
                placeholder="Button URI"
                value={buttonURI}
                name="jam-room-button-uri"
                autoComplete="off"
                onChange={e => {
                  setButtonURI(e.target.value);
                }}
              ></input>
              <div className="p-2 text-gray-500 italic">
                Set the link for the {`'call to action'`} button.{' '}
                <span className="text-gray-400">(optional)</span>
              </div>

              <br />
              <input
                className="rounded placeholder-gray-400 bg-gray-50 w-full md:w-96"
                type="text"
                placeholder="Button Text"
                value={buttonText}
                name="jam-room-button-text"
                autoComplete="off"
                onChange={e => {
                  setButtonText(e.target.value);
                }}
              ></input>
              <div className="p-2 text-gray-500 italic">
                Set the text for the {`'call to action'`} button.{' '}
                <span className="text-gray-400">(optional)</span>
              </div>
            </div>
            <button
              onClick={submit}
              type="button"
              className="inline-flex items-center px-6 py-3 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 max-w-max focus:ring-indigo-500"
            >
              Start a room &#8594;
          </button>
          </form>
        </div>
        <div>
          <img style={{ maxHeight: "95%" }} src="img/circles.svg"></img>
        </div>
      </div>
    </div>
  );
}
