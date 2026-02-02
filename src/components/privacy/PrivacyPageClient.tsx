"use client";

import { motion } from "framer-motion";
import BackgroundMotion from "~/components/ui/BackgroundMotion";
import { useNotifications } from "~/hooks/useNotifications";
// import WaveFooterSection from "~/components/home/WaveFooterSection";

export default function PrivacyPageClient() {
  useNotifications();
  
  return (
    <main className="relative pt-20 bg-white dark:bg-gray-950">
      <BackgroundMotion />
      <div className="mx-auto max-w-4xl px-6 py-20 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Chính sách quyền riêng tư
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Chính sách quyền riêng tư này mô tả cách Cardano2VN thu thập, sử dụng và bảo vệ thông tin cá nhân của bạn.
          </p>
        </motion.div>

                 <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 dark:border-gray-700/50 p-8 md:p-12">
          <div className="prose prose-lg dark:prose-invert max-w-none">
            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Chúng tôi là ai</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Địa chỉ website của chúng tôi: <a href="https://lms.cardano2vn.io" className="text-blue-600 dark:text-blue-400 hover:underline">https://lms.cardano2vn.io</a>.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Bình luận</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Khi khách truy cập để lại bình luận trên website, chúng tôi thu thập dữ liệu hiển thị trong biểu mẫu bình luận, cùng với địa chỉ IP và chuỗi tác nhân trình duyệt của khách để hỗ trợ phát hiện spam.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Một chuỗi ẩn danh được tạo từ địa chỉ email của bạn (còn gọi là hash) có thể được cung cấp cho dịch vụ Gravatar để kiểm tra bạn có đang sử dụng dịch vụ hay không. Chính sách quyền riêng tư của Gravatar có tại: <a href="https://automattic.com/privacy/" className="text-blue-600 dark:text-blue-400 hover:underline">https://automattic.com/privacy/</a>. Sau khi bình luận của bạn được chấp thuận, ảnh đại diện của bạn sẽ hiển thị công khai trong ngữ cảnh bình luận.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Phương tiện</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Nếu bạn tải hình ảnh lên website, vui lòng tránh tải các hình ảnh có chứa dữ liệu vị trí (EXIF GPS). Khách truy cập có thể tải về và trích xuất dữ liệu vị trí từ hình ảnh trên website.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cookie</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Nếu bạn để lại bình luận trên website, bạn có thể chọn lưu tên, email và địa chỉ website trong cookie. Điều này giúp bạn không phải nhập lại thông tin khi bình luận lần sau. Các cookie này sẽ tồn tại trong một năm.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Nếu bạn truy cập trang đăng nhập, chúng tôi sẽ thiết lập một cookie tạm thời để kiểm tra trình duyệt có chấp nhận cookie hay không. Cookie này không chứa dữ liệu cá nhân và sẽ bị xóa khi bạn đóng trình duyệt.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Khi bạn đăng nhập, chúng tôi sẽ tạo một số cookie để lưu thông tin đăng nhập và tuỳ chọn hiển thị màn hình. Cookie đăng nhập tồn tại trong 2 ngày, cookie tùy chọn màn hình tồn tại trong 1 năm. Nếu chọn "Ghi nhớ tôi", đăng nhập của bạn sẽ duy trì trong 2 tuần. Khi đăng xuất, các cookie đăng nhập sẽ bị xóa.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Nếu bạn chỉnh sửa hoặc xuất bản bài viết, một cookie bổ sung sẽ được lưu trong trình duyệt. Cookie này không chứa dữ liệu cá nhân mà chỉ chứa ID của bài viết vừa chỉnh sửa. Cookie hết hạn sau 1 ngày.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Nội dung nhúng từ trang web khác</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Các bài viết trên website này có thể bao gồm nội dung nhúng (ví dụ: video, hình ảnh, bài viết…). Nội dung nhúng từ website khác sẽ hoạt động giống như khi bạn truy cập trực tiếp website đó.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Các website này có thể thu thập dữ liệu về bạn, sử dụng cookie, nhúng các công cụ theo dõi của bên thứ ba và giám sát sự tương tác của bạn với nội dung nhúng, bao gồm việc theo dõi nếu bạn có tài khoản và đang đăng nhập tại website đó.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Chúng tôi chia sẻ dữ liệu của bạn với ai</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Nếu bạn yêu cầu đặt lại mật khẩu, địa chỉ IP của bạn có thể được đưa vào email đặt lại mật khẩu.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Thời gian lưu trữ dữ liệu</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Nếu bạn để lại bình luận, bình luận và siêu dữ liệu của nó sẽ được lưu giữ vô thời hạn. Điều này giúp chúng tôi tự động nhận diện và phê duyệt các bình luận tiếp theo thay vì giữ lại trong hàng đợi kiểm duyệt.
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Đối với người dùng đăng ký trên website (nếu có), chúng tôi lưu trữ thông tin cá nhân mà họ cung cấp trong hồ sơ người dùng. Tất cả người dùng có thể xem, chỉnh sửa hoặc xóa thông tin cá nhân bất cứ lúc nào (ngoại trừ tên đăng nhập). Quản trị viên website cũng có thể xem và chỉnh sửa thông tin đó.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Quyền của bạn đối với dữ liệu</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Nếu bạn có tài khoản trên website này hoặc đã để lại bình luận, bạn có thể yêu cầu nhận một tệp xuất dữ liệu cá nhân mà chúng tôi lưu giữ về bạn, bao gồm mọi dữ liệu bạn đã cung cấp. Bạn cũng có thể yêu cầu xoá dữ liệu cá nhân mà chúng tôi đang lưu giữ. Điều này không bao gồm dữ liệu mà chúng tôi buộc phải lưu giữ vì mục đích hành chính, pháp lý hoặc bảo mật.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Dữ liệu của bạn được gửi tới đâu</h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Bình luận của khách truy cập có thể được kiểm tra thông qua dịch vụ phát hiện spam tự động.
              </p>
            </section>

            <div className="mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN', {
                  day: '2-digit',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
                     </div>
         </div>
      </div>
{/*       
      <WaveFooterSection /> */}
    </main>
  );
}
