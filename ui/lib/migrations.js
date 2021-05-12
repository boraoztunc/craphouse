import {getStorage} from './local-storage';
import {set, update} from 'use-minimal-state';

export const importLegacyIdentity = () => {
  const identity = getStorage(localStorage, 'identity');
  if (!identity) return;

  // MIGRATIONS
  if (!identity.publicKey && identity.keyPair.publicKey) {
    set(identity, 'publicKey', identity.keyPair.publicKey);
    set(identity, 'secretKey', identity.keyPair.secretKey);
  }
  // nuked identity.info
  if (!identity.info) {
    set(identity, 'info', {id: identity.publicKey});
  }

  // missing .id
  if (!identity.info.id) {
    identity.info.id = identity.publicKey;
    update(identity, 'info');
  }

  // REMOVE WHEN ALL old twitter identities converted
  if (identity.info.twitter) {
    let twitterIdentity = {
      type: 'twitter',
      id: identity.info.twitter,
      verificationInfo: identity.info.tweet,
    };
    if (
      !identity.info.identities ||
      !identity.info.identities.length ||
      !identity.info.identities[0].id
    ) {
      set(identity, 'info', {
        ...identity.info,
        identities: [twitterIdentity],
      });
    }
    set(identity, 'info', {
      ...identity.info,
      twitter: undefined,
      tweet: undefined,
    });
  }

  return identity;
};
