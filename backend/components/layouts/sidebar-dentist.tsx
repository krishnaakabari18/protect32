'use client';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useDispatch, useSelector } from 'react-redux';
import Link from 'next/link';
import { toggleSidebar } from '@/store/themeConfigSlice';
import { IRootState } from '@/store';
import { useEffect } from 'react';
import IconCaretsDown from '@/components/icon/icon-carets-down';
import IconMenuDashboard from '@/components/icon/menu/icon-menu-dashboard';
import IconMinus from '@/components/icon/icon-minus';
import IconMenuUsers from '@/components/icon/menu/icon-menu-users';
import IconUser from '@/components/icon/icon-user';
import IconCalendar from '@/components/icon/icon-calendar';
import IconDollarSign from '@/components/icon/icon-dollar-sign';
import IconFile from '@/components/icon/icon-file';
import IconStar from '@/components/icon/icon-star';
import IconBell from '@/components/icon/icon-bell';
import IconNotes from '@/components/icon/icon-notes';
import { usePathname } from 'next/navigation';

const SidebarDentist = () => {
    const dispatch = useDispatch();
    const pathname = usePathname();
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);

    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        setActiveRoute();
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
    }, [pathname]);

    const setActiveRoute = () => {
        let allLinks = document.querySelectorAll('.sidebar ul a.active');
        for (let i = 0; i < allLinks.length; i++) {
            const element = allLinks[i];
            element?.classList.remove('active');
        }
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        selector?.classList.add('active');
    };

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
            >
                <div className="h-full bg-white dark:bg-black">
                    <div className="flex items-center justify-between px-4 py-3">
                        <Link href="/" className="main-logo flex shrink-0 items-center">
                            <img className="ml-[5px] w-8 flex-none" src="/assets/images/logo.svg" alt="logo" />
                            <span className="align-middle text-2xl font-semibold ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light lg:inline">Dentist</span>
                        </Link>

                        <button
                            type="button"
                            className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 rtl:rotate-180 dark:text-white-light dark:hover:bg-dark-light/10"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconCaretsDown className="m-auto rotate-90" />
                        </button>
                    </div>
                    <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
                        <ul className="relative space-y-0.5 p-4 py-0 font-semibold">
                            {/* Dashboard */}
                            <li className="nav-item">
                                <Link href="/" className="group">
                                    <div className="flex items-center">
                                        <IconMenuDashboard className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Dashboard</span>
                                    </div>
                                </Link>
                            </li>

                            <h2 className="-mx-4 mb-1 mt-4 flex items-center bg-white-light/30 px-7 py-3 font-extrabold uppercase dark:bg-dark dark:bg-opacity-[0.08]">
                                <IconMinus className="hidden h-5 w-4 flex-none" />
                                <span>Management</span>
                            </h2>

                            {/* Users */}
                            <li className="nav-item">
                                <Link href="/management/users" className="group">
                                    <div className="flex items-center">
                                        <IconMenuUsers className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Users</span>
                                    </div>
                                </Link>
                            </li>

                            {/* Patients */}
                            <li className="nav-item">
                                <Link href="/management/patients" className="group">
                                    <div className="flex items-center">
                                        <IconUser className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Patients</span>
                                    </div>
                                </Link>
                            </li>

                            {/* Providers */}
                            <li className="nav-item">
                                <Link href="/management/providers" className="group">
                                    <div className="flex items-center">
                                        <IconUser className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Providers</span>
                                    </div>
                                </Link>
                            </li>

                            {/* Appointments */}
                            <li className="nav-item">
                                <Link href="/management/appointments" className="group">
                                    <div className="flex items-center">
                                        <IconCalendar className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Appointments</span>
                                    </div>
                                </Link>
                            </li>

                            {/* Treatment Plans */}
                            <li className="nav-item">
                                <Link href="/management/treatment-plans" className="group">
                                    <div className="flex items-center">
                                        <IconNotes className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Treatment Plans</span>
                                    </div>
                                </Link>
                            </li>

                            {/* Prescriptions */}
                            <li className="nav-item">
                                <Link href="/management/prescriptions" className="group">
                                    <div className="flex items-center">
                                        <IconFile className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Prescriptions</span>
                                    </div>
                                </Link>
                            </li>

                            {/* Plans */}
                            <li className="nav-item">
                                <Link href="/management/plans" className="group">
                                    <div className="flex items-center">
                                        <IconDollarSign className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Plans</span>
                                    </div>
                                </Link>
                            </li>

                            {/* Payments */}
                            <li className="nav-item">
                                <Link href="/management/payments" className="group">
                                    <div className="flex items-center">
                                        <IconDollarSign className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Payments</span>
                                    </div>
                                </Link>
                            </li>

                            {/* Documents */}
                            <li className="nav-item">
                                <Link href="/management/documents" className="group">
                                    <div className="flex items-center">
                                        <IconFile className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Documents</span>
                                    </div>
                                </Link>
                            </li>

                            {/* Reviews */}
                            <li className="nav-item">
                                <Link href="/management/reviews" className="group">
                                    <div className="flex items-center">
                                        <IconStar className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Reviews</span>
                                    </div>
                                </Link>
                            </li>

                            {/* Notifications */}
                            <li className="nav-item">
                                <Link href="/management/notifications" className="group">
                                    <div className="flex items-center">
                                        <IconBell className="shrink-0 group-hover:!text-primary" />
                                        <span className="text-black ltr:pl-3 rtl:pr-3 dark:text-[#506690] dark:group-hover:text-white-dark">Notifications</span>
                                    </div>
                                </Link>
                            </li>
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default SidebarDentist;
