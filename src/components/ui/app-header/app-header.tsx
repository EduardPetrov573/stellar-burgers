import {
  BurgerIcon,
  ListIcon,
  ProfileIcon,
  Logo,
  CloseIcon,
} from '@krgaa/react-developer-burger-ui-components';
import { clsx } from 'clsx';
import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';

import { ProfileMenu } from '@components/profile-menu';

import type { TAppHeaderUIProps } from './type';

import styles from './app-header.module.css';

export const AppHeaderUI = ({ userName }: TAppHeaderUIProps): React.JSX.Element => {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const constructorActive =
    location.pathname === '/' || location.pathname.startsWith('/ingredients/');
  const feedActive = location.pathname.startsWith('/feed');
  const profileActive = location.pathname.startsWith('/profile');
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);
  useEffect(() => {
    if (!menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', closeOnEscape);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return (): void => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = previousOverflow;
    };
  }, [menuOpen]);

  return (
    <header className={styles.header}>
      <nav className={clsx(styles.menu, 'p-4')} aria-label="Основная навигация">
        <div className={styles.menu_part_left}>
          <NavLink
            to="/"
            className={clsx(styles.link, constructorActive && styles.link_active)}
            end
          >
            <BurgerIcon type={constructorActive ? 'primary' : 'secondary'} />
            <span className="text text_type_main-default ml-2 mr-10">Конструктор</span>
          </NavLink>
          <NavLink
            to="/feed"
            className={clsx(styles.link, feedActive && styles.link_active)}
          >
            <ListIcon type={feedActive ? 'primary' : 'secondary'} />
            <span className="text text_type_main-default ml-2">Лента заказов</span>
          </NavLink>
        </div>
        <Link to="/" className={styles.logo} aria-label="Stellar Burgers — главная">
          <Logo className="" />
        </Link>
        <NavLink
          to="/profile"
          className={clsx(
            styles.link,
            styles.link_position_last,
            profileActive && styles.link_active
          )}
        >
          <ProfileIcon type={profileActive ? 'primary' : 'secondary'} />
          <span className="text text_type_main-default ml-2">
            {userName ?? 'Личный кабинет'}
          </span>
        </NavLink>
        <button
          type="button"
          className={styles.menu_toggle}
          aria-label="Открыть меню"
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          onClick={() => setMenuOpen(true)}
        >
          ☰
        </button>
      </nav>
      {menuOpen && (
        <nav
          id="mobile-menu"
          className={styles.mobile_menu}
          aria-label="Мобильная навигация"
        >
          <div className={styles.mobile_heading}>
            <h2 className="text text_type_main-large">Меню</h2>
            <button
              type="button"
              aria-label="Закрыть меню"
              onClick={() => setMenuOpen(false)}
            >
              <CloseIcon type="primary" />
            </button>
          </div>
          {userName ? (
            <>
              <button
                type="button"
                className={clsx(styles.mobile_profile, 'text text_type_main-default')}
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <ProfileIcon type="primary" />
                Личный кабинет<span>{profileOpen ? '▴' : '▾'}</span>
              </button>
              {profileOpen && (
                <div className={styles.mobile_submenu}>
                  <ProfileMenu compact />
                </div>
              )}
            </>
          ) : (
            <Link to="/login" className={styles.link}>
              <ProfileIcon type="primary" />
              <span className="ml-2 text text_type_main-default">Личный кабинет</span>
            </Link>
          )}
          <NavLink
            to="/"
            end
            className={clsx(styles.link, constructorActive && styles.link_active)}
          >
            <BurgerIcon type={constructorActive ? 'primary' : 'secondary'} />
            <span className="ml-2 text text_type_main-default">
              Конструктор бургеров
            </span>
          </NavLink>
          <NavLink
            to="/feed"
            className={clsx(styles.link, feedActive && styles.link_active)}
          >
            <ListIcon type={feedActive ? 'primary' : 'secondary'} />
            <span className="ml-2 text text_type_main-default">Лента заказов</span>
          </NavLink>
        </nav>
      )}
    </header>
  );
};
