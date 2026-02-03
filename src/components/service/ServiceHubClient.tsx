"use client";

import Link from "next/link";
import Title from "~/components/title";
import BackgroundMotion from "~/components/ui/BackgroundMotion";

const cards = [
  {
    href: "/about",
    title: "Our Team",
    description:
      "Gặp gỡ những con người đứng sau tầm nhìn của Cardano2vn, từ các nhà phát triển sản phẩm đến chuyên gia blockchain và những người xây dựng cộng đồng.",
    cta: "Meet the Team",
  },
  {
    href: "/project",
    title: "Our project catalyst",
    description:
      "Khám phá cách chúng tôi ứng dụng blockchain và các công cụ sáng tạo để xây dựng niềm tin, tăng cường quản trị và quản lý đóng góp.",
    cta: "Learn More",
  },
  {
    href: "/our-service",
    title: "Our Service",
    description:
      "Hỗ trợ hệ sinh thái thông qua các sáng kiến SPO và DRep, đồng thời khám phá những dịch vụ chúng tôi cung cấp cho cộng đồng.",
    cta: "Explore",
  },
];

export default function ServiceHubClient() {
  return (
    <main className="relative pt-16 bg-white dark:bg-gray-950 min-h-screen">
      <BackgroundMotion />
      <section className="relative z-10 mx-auto max-w-7xl px-4 pt-6 pb-12 sm:px-6 sm:pt-8 sm:pb-20 lg:px-8 lg:pt-8 lg:pb-20">
        <div>
          <Title
            title="About Us"
            description="Truy cập nhanh About, Projects và Our Service — khám phá Cardano2vn: chúng tôi là ai, đang xây gì và cách chúng tôi đóng góp cho hệ sinh thái."
          />
        </div>

        <div className="mx-auto mb-16">
          <div className="rounded-sm border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 p-8 backdrop-blur-sm">
            <h3 className="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Đội ngũ Cardano2VN</h3>
            <p className="mb-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              Cardano2VN là một tập thể gồm những người đam mê Cardano, các nhà phát triển và những người xây dựng cộng đồng, cùng chung mục tiêu
              thúc đẩy hệ sinh thái Cardano tại Việt Nam. Sứ mệnh của chúng tôi là kết nối giữa công nghệ truyền thống và đổi mới trên blockchain,
              giúp mọi người dễ dàng tiếp cận Cardano hơn.
            </p>
            <p className="mb-4 text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              Với kinh nghiệm trải rộng từ phát triển smart contract, giao thức DeFi đến giáo dục cộng đồng và tham gia quản trị, chúng tôi hợp tác
              để tạo ra các giải pháp bền vững mang lại giá trị cho toàn bộ cộng đồng Cardano. Nền tảng đa dạng về giáo dục, phát triển blockchain,
              quản lý sản phẩm và xây dựng cộng đồng giúp chúng tôi nhìn nhận vấn đề từ nhiều góc độ.
            </p>
            <p className="text-lg leading-relaxed text-gray-600 dark:text-gray-300">
              Hãy đồng hành cùng chúng tôi xây dựng tương lai của tài chính phi tập trung và quản trị trên Cardano. Cùng nhau, chúng ta kiến tạo nền
              tảng cho mô hình làm việc phân tán dựa trên niềm tin và nuôi dưỡng một hệ sinh thái Cardano sôi động, cởi mở tại Việt Nam.
            </p>
          </div>
        </div>

        <div className="grid gap-6 md:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.href}
              className="rounded-sm border border-gray-200 dark:border-white/20 bg-white dark:bg-gray-800/50 p-6 sm:p-8 backdrop-blur-sm"
            >
              <Link href={card.href} className="flex h-full flex-col">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{card.title}</h3>
                <p className="text-gray-600 dark:text-gray-300 flex-1 leading-relaxed">{card.description}</p>
                <span className="mt-6 inline-flex items-center text-sm font-semibold text-blue-600 dark:text-blue-400">
                  {card.cta}
                  <svg className="ml-2 h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l5 5a1 1 0 010 1.414l-5 5a1 1 0 11-1.414-1.414L13.586 10 10.293 6.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </span>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}


