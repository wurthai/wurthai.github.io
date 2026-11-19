# Đăng write-up Markdown

1. Tạo file `posts/ten-bai.md`.
2. Đặt ảnh trong `posts/images/ten-bai/`, rồi chèn bằng `![Mô tả ảnh](images/ten-bai/anh.png)`.
3. Viết code trong khối ba dấu backtick, ghi tên ngôn ngữ như `python` hoặc `bash`.
4. Thêm mục vào `posts.json`: `{ "slug": "ten-bai", "title": "Tên bài", "category": "Web Security", "summary": "Mô tả ngắn" }`. Slug phải khớp tên file Markdown.
5. Commit và push lên GitHub Pages. Bài sẽ hiện ở `writeups/index.html` và mở tại `reader.html?post=ten-bai`.

Có thể thêm bao nhiêu ảnh, đoạn code và tiêu đề tùy ý. Trình đọc Markdown nằm trong `vendor/`, nên không cần tải thư viện từ CDN.

## Ảnh bìa và thông tin trên thẻ

- Thêm `"cover": "covers/ten-bai.svg"` (hoặc PNG/JPG/WebP) vào mục bài viết để đặt ảnh bìa.
- Thêm `"date": "YYYY-MM-DD"` nếu biết ngày đăng. Nếu chưa có ngày, thẻ sẽ không hiện ngày giả.
- Số từ được tính từ Markdown (bao gồm code), thời gian đọc ước tính ở tốc độ 220 từ/phút. Bài có `parts` sẽ cộng nội dung các phần.
- Các thẻ tự xen kẽ ảnh trái/phải trên desktop và xếp ảnh trên nội dung trên điện thoại.
