import * as React from 'react';

import { MenuButton } from '~ui-intro-menus/MenuButton';
import { Monsters, QuestForDungeonsLogo } from '~ui-misc';
import { CHeroesAndMonsters } from './HeroesAndMonsters';
import { IntroPane } from './IntroPane';


import { css as cssMain } from '~client';
// Import { css as cssDungeon } from '~ui-dungeon';


export class Intro extends React.Component {
  public constructor(props: any) {
    super(props);
  }

  public render() {
    return (
      <IntroPane>
        <CHeroesAndMonsters>
          <MenuButton>
            Continue <span className={cssMain('red')}>Some red</span>
          </MenuButton>
          <QuestForDungeonsLogo/>
          <MenuButton>
            New Game
          </MenuButton>
           { /*<Monsters />*/}
        </CHeroesAndMonsters>
      </IntroPane>
    );
  }
}

