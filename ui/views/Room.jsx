import React, { useEffect, useState } from 'react';
import state, { swarm } from '../logic/state';
import { use } from 'use-minimal-state';
import EnterRoom from './EnterRoom';
import RoomHeader from './RoomHeader';
import { useCurrentIdentity } from '../logic/identity';
import { openModal } from './Modal';
import { EditRoomModal } from './EditRoom';
import useWakeLock from '../lib/use-wake-lock';
import { AudienceAvatar, StageAvatar } from './Avatar';
import { useMqParser } from '../logic/tailwind-mqp';
import Container from './Container';
import Navigation from './Navigation';
import UAParser from 'ua-parser-js';
import { usePushToTalk } from '../logic/hotkeys';
import { disconnectRoom, maybeConnectRoom } from '../logic/room';
import { stopAudio } from '../logic/audio';
import Icon from '../icons/icon'
import Crap from '../icons/crap'
const userAgent = UAParser();
const inWebView =
  userAgent.browser?.name === 'Chrome WebView' ||
  (userAgent.os?.name === 'iOS' && userAgent.browser?.name !== 'Mobile Safari');

export default function Room({ room, roomId }) {
  // room = {name, description, moderators: [peerId], speakers: [peerId]}
  useWakeLock();
  usePushToTalk();

  // connect with signaling server
  useEffect(() => {
    maybeConnectRoom(roomId);
    return () => {
      // clean up on unmount
      disconnectRoom(roomId);
      stopAudio();
    };
  }, [roomId]);

  let myInfo = useCurrentIdentity().info;
  let [
    reactions,
    raisedHands,
    identities,
    speaking,
    iSpeak,
    iModerate,
  ] = use(state, [
    'reactions',
    'raisedHands',
    'identities',
    'speaking',
    'iAmSpeaker',
    'iAmModerator',
  ]);
  let [peers, peerState, myPeerState] = use(swarm, [
    'stickyPeers',
    'peerState',
    'myPeerState',
  ]);

  let hasEnteredRoom = myPeerState?.inRoom;

  let [editRole, setEditRole] = useState(null);
  let [editSelf, setEditSelf] = useState(false);

  let {
    name,
    description,
    schedule,
    logoURI,
    buttonURI,
    buttonText,
    speakers,
    moderators,
    closed,
    shareUrl,
  } = room || {};

  let mqp = useMqParser();

  if (!iModerate && closed) {
    return (
      <EnterRoom
        roomId={roomId}
        name={name}
        description={description}
        schedule={schedule}
        logoURI={logoURI}
        closed={closed}
        buttonURI={buttonURI}
        buttonText={buttonText}
      />
    );
  }

  if (!hasEnteredRoom) {
    return (
      <EnterRoom
        roomId={roomId}
        name={name}
        description={description}
        schedule={schedule}
        logoURI={logoURI}
      />
    );
  }

  let myPeerId = myInfo.id;
  let stagePeers = (speakers || []).filter(id => id in peers);
  let audiencePeers = Object.keys(peers || {}).filter(
    id => !stagePeers.includes(id)
  );

  let myHandRaised = raisedHands.has(myPeerId);


  return (
    <Container style={{ display: 'flex', flexDirection: 'column' }}>
      <div style={{ maxWidth: '250px' }} className='absolute left-10 grid gap-4 place-items-center'>
        <Icon></Icon>
        <Crap style={{ width: '100%' }}></Crap>
      </div>
      <div
        className={mqp('flex flex-col pt-2 md:pt-10 md:p-10')}
        style={{ flex: '1', overflowY: 'auto', minHeight: '0' }}
      >

        <div
          className={
            inWebView
              ? 'rounded bg-blue-50 border border-blue-150 text-gray-600 ml-2 p-3 mb-3 inline text-center'
              : 'hidden'
          }
        >
          {/*  heroicons/exclamation-circle */}
          <svg
            className="w-5 h-5 inline mr-2 -mt-1"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Open in {userAgent.os?.name === 'iOS' ? 'Safari' : 'Chrome'} for best
          experience.
          <br />
          <a
            className="underline"
            href="https://gitlab.com/jam-systems/jam"
            target="_blank"
            rel="nofollow noreferrer"
          >
            Learn more
          </a>
          .
        </div>
        <div
          className={
            closed
              ? 'rounded bg-blue-50 border border-blue-150 text-gray-600 ml-2 p-3 mb-3 inline text-center'
              : 'hidden'
          }
        >
          {/*  heroicons/exclamation-circle */}
          <svg
            className="w-5 h-5 inline mr-2 -mt-1"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          Room is closed
        </div>
        <RoomHeader
          {...{ name, description, logoURI, buttonURI, buttonText }}
          editRoom={
            iModerate && (() => openModal(EditRoomModal, { roomId, room }))
          }
        />

        {/* Main Area */}
        <div className="">
          {/* Stage */}
          <div className="">
            <ol className="flex flex-wrap">
              {iSpeak && (
                <StageAvatar
                  key={myPeerId}
                  peerId={myPeerId}
                  {...{ speaking, moderators, reactions, room }}
                  peerState={myPeerState}
                  info={myInfo}
                  onClick={() => setEditSelf(true)}
                />
              )}
              {stagePeers.map(peerId => (
                <StageAvatar
                  key={peerId}
                  {...{ speaking, moderators, room }}
                  {...{ peerId, peerState, reactions }}
                  peerState={peerState[peerId]}
                  info={identities[peerId]}
                  onClick={iModerate ? () => setEditRole(peerId) : undefined}
                />
              ))}
            </ol>
          </div>

          <br />
          {/* Audience */}
          <h3 className="text-gray-400 pl-4 pb-4">Audience</h3>
          <ol className="flex flex-wrap">
            {!iSpeak && (
              <AudienceAvatar
                {...{ reactions, room }}
                peerId={myPeerId}
                peerState={myPeerState}
                info={myInfo}
                handRaised={myHandRaised}
                onClick={() => setEditSelf(true)}
              />
            )}
            {audiencePeers.map(peerId => (
              <AudienceAvatar
                key={peerId}
                {...{ peerId, peerState, reactions, room }}
                peerState={peerState[peerId]}
                info={identities[peerId]}
                handRaised={iModerate && raisedHands.has(peerId)}
                onClick={iModerate ? () => setEditRole(peerId) : undefined}
              />
            ))}
          </ol>
        </div>

        <div style={{ height: '136px', flex: 'none' }} />
      </div>
      <Navigation
        {...{ roomId, room, editRole, setEditRole, editSelf, setEditSelf }}
      />
    </Container>
  );
}
