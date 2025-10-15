# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - link "Quay về trang chủ" [ref=e3]:
      - /url: /
      - button "Quay về trang chủ" [ref=e4] [cursor=pointer]:
        - img
        - text: Quay về trang chủ
    - generic [ref=e5]:
      - generic [ref=e6]:
        - generic [ref=e7]: Đăng nhập
        - generic [ref=e8]: Chào mừng trở lại! Hãy truy cập tài khoản của bạn.
      - generic [ref=e10]:
        - generic [ref=e11]:
          - generic [ref=e12]:
            - generic [ref=e13]: Email
            - textbox "Email" [ref=e14]:
              - /placeholder: your.email@example.com
          - generic [ref=e15]:
            - generic [ref=e16]: Mật khẩu
            - textbox "Mật khẩu" [ref=e17]:
              - /placeholder: Mật khẩu của bạn
        - button "Đăng nhập" [ref=e18] [cursor=pointer]
      - paragraph [ref=e20]:
        - text: Chưa có tài khoản?
        - link "Đăng ký" [ref=e21]:
          - /url: /auth/register
  - region "Notifications (F8)":
    - list
  - alert [ref=e22]
```