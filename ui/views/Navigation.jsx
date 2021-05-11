import React, {useMemo, useState} from 'react';
import {leaveRoom} from '../logic/main';
import state from '../logic/state';
import {set, use} from 'use-minimal-state';
import {currentId} from '../logic/identity';
import {sendReaction, raiseHand} from '../logic/reactions';
import EditRole, {EditSelf} from './EditRole';
import {breakpoints, useWidth} from '../logic/tailwind-mqp';
import UAParser from 'ua-parser-js';
import {requestAudio} from '../logic/audio';
import {openModal} from './Modal';
import {InfoModal} from './InfoModal';
import {MicOffSvg, MicOnSvg} from './Svg';

const reactionEmojis = ['❤️', '💯', '😂', '😅', '😳', '🤔'];

var userAgent = UAParser();

let navigationStyle = {
  position: 'fixed',
  bottom: '0',
  marginLeft: '-15px',
  flex: 'none',
  borderLeft: '2px solid lightgrey',
  borderRight: '2px solid lightgrey',
};

let navigationStyleSmall = {
  padding: '0 22px 22px 22px',
  marginLeft: '-12px',
  boxSizing: 'border-box',
  borderLeft: '0px',
  borderRight: '0px',
};

export default function Navigation({
  roomId,
  room,
  editRole,
  setEditRole,
  editSelf,
  setEditSelf,
}) {
  let [myAudio, micMuted, raisedHands, iSpeak] = use(state, [
    'myAudio',
    'micMuted',
    'raisedHands',
    'iAmSpeaker',
  ]);

  let micOn = myAudio?.active;

  let [showReactions, setShowReactions] = useState(false);

  let {color, speakers, moderators} = room || {};

  let isColorDark = useMemo(() => isDark(color), [color]);

  let myPeerId = currentId();
  let myHandRaised = raisedHands.has(myPeerId);

  let width = useWidth();

  let talk = () => {
    if (micOn) {
      set(state, 'micMuted', !micMuted);
    } else {
      if (userAgent.browser?.name === 'Safari') {
        location.reload();
      } else {
        requestAudio();
      }
    }
  };

  return (
    <div
      className="z-10 bg-white p-4"
      style={{
        ...navigationStyle,
        ...(width < breakpoints.sm ? navigationStyleSmall : null),
        width: width < 720 ? '100%' : '700px',
      }}
    >
      {editRole && (
        <EditRole
          peerId={editRole}
          speakers={speakers}
          moderators={moderators}
          onCancel={() => setEditRole(null)}
        />
      )}
      {editSelf && <EditSelf onCancel={() => setEditSelf(false)} />}
      {/* microphone mute/unmute button */}
      {/* TODO: button content breaks between icon and text on small screens. fix by using flexbox & text-overflow */}
      <div className="flex">
        <button
          onClick={iSpeak ? talk : () => raiseHand(!myHandRaised)}
          onKeyUp={e => {
            // don't allow clicking mute button with space bar to prevent confusion with push-to-talk w/ space bar
            if (e.key === ' ') e.preventDefault();
          }}
          className="flex-grow select-none h-12 mt-4 px-6 text-lg text-white bg-gray-600 rounded-lg focus:outline-none active:bg-gray-600"
          style={{
            backgroundColor: color || '#4B5563',
            color: isColorDark ? 'white' : 'black',
          }}
        >
          {iSpeak && (
            <>
              {micOn && micMuted && (
                <>
                  <MicOffSvg
                    className="w-5 h-5 mr-2 opacity-80 inline-block"
                    stroke={color}
                  />
                  Your&nbsp;microphone&nbsp;is&nbsp;off
                </>
              )}
              {micOn && !micMuted && (
                <>
                  <MicOnSvg
                    className="w-5 h-5 mr-2 opacity-80 inline-block"
                    stroke={color}
                  />
                  Your&nbsp;microphone&nbsp;is&nbsp;on
                </>
              )}
              {!micOn && <>Allow&nbsp;microphone&nbsp;access</>}
            </>
          )}
          {!iSpeak && (
            <>
              {myHandRaised ? (
                <>Stop&nbsp;raising&nbsp;hand</>
              ) : (
                <>✋🏽&nbsp;Raise&nbsp;hand&nbsp;to&nbsp;get&nbsp;on&nbsp;stage</>
              )}
            </>
          )}
        </button>
      </div>
      <br />
      <div className="flex relative">
        <button
          onClick={() => setShowReactions(s => !s)}
          className="flex-grow select-none text-center h-12 px-6 text-lg text-black bg-gray-200 rounded-lg focus:shadow-outline active:bg-gray-300"
        >
          {/* heroicons/emoji-happy */}
          <svg
            className="text-gray-600 w-6 h-6 inline-block"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>
        {showReactions && (
          <div className="text-4xl w-64 flex-shrink text-black text-center bg-gray-200 rounded-lg absolute left-0 bottom-14">
            {reactionEmojis.map(r => (
              <button
                className="m-2 p-2 human-radius select-none px-3 bg-gray-100 active:bg-gray-50"
                key={r}
                onClick={() => {
                  sendReaction(r);
                }}
              >
                {r}
              </button>
            ))}
          </div>
        )}

        {/* Info */}
        <button
          onClick={() => {
            openModal(InfoModal, {roomId, room});
          }}
          className="hidden ml-3 select-none h-12 px-6 text-lg text-black bg-gray-200 rounded-lg focus:shadow-outline active:bg-gray-300"
        >
          {/* information-circle */}
          <svg
            className="text-gray-600 w-6 h-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </button>

        {/* Leave */}
        <button
          className="flex-shrink ml-3 select-none h-12 px-6 text-lg text-black bg-gray-200 rounded-lg focus:shadow-outline active:bg-gray-300"
          onClick={() => leaveRoom(roomId)}
        >
          🖖🏽&nbsp;Leave
        </button>
      </div>
    </div>
  );
}

function isDark(hex) {
  if (!hex) return true;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return r + g + b < 128 * 3;
}
