<template>
  <div class="view-account">
    <div class="view-account-header"></div>
    <div class="view-account-container">
      <div class="view-account-top">
        <div class="view-account-top-logo">
          <img src="~@/assets/images/account-logo.png" alt="" />
        </div>
        <div class="view-account-top-desc">Naive Ui Admin中台前端/设计解决方案</div>
      </div>
      <div class="view-account-form">
        <n-form
          ref="formRef"
          label-placement="left"
          size="large"
          :model="formInline"
          :rules="rules"
        >
          <n-form-item path="email">
            <n-input v-model:value="formInline.email" placeholder="请输入邮箱">
              <template #prefix>
                <n-icon size="18" color="#808695">
                  <PersonOutline />
                </n-icon>
              </template>
            </n-input>
          </n-form-item>
          <n-form-item path="password">
            <n-input
              v-model:value="formInline.password"
              type="password"
              show-password-toggle
              placeholder="请输入密码"
            >
              <template #prefix>
                <n-icon size="18" color="#808695">
                  <LockClosedOutline />
                </n-icon>
              </template>
            </n-input>
          </n-form-item>

          <!-- 自动登录 -->

          <!-- 忘记密码 -->

          <n-form-item>
            <n-button
              type="primary"
              class="login-button"
              @click="handleLogin"
              size="large"
              :loading="loginLoading"
              block
            >
              登录
            </n-button>
            <n-button
              class="register-button"
              type="primary"
              size="large"
              @click="testHalo"
              :loading="RegisterLoading"
              block
              ghost
            >
              注册
            </n-button>
          </n-form-item>
        </n-form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
  import { defineComponent, reactive, toRefs, ref } from 'vue';
  import { PersonOutline, LockClosedOutline, LogoGithub, LogoFacebook } from '@vicons/ionicons5';
  import { useRoute, useRouter } from 'vue-router';
  import { useUserStore } from '@/store/modules/user';
  import { useMessage } from 'naive-ui';
  import { ResultEnum } from '@/enums/httpEnum';
  import logo from '@/assets/images/logo.png';

  interface FormState {
    email: string;
    password: string;
  }

  export default defineComponent({
    components: { PersonOutline, LockClosedOutline, LogoGithub, LogoFacebook },
    setup() {
      const formRef = ref();
      const message = useMessage();
      const state = reactive({
        loginLoading: false,
        RegisterLoading: false,
        autoLogin: true,
        formInline: {
          email: '1379978893@qq.com',
          password: '111111',
        },
      });
      const rules = {
        email: { required: true, message: '请输入邮箱', trigger: 'blur' },
        password: { required: true, message: '请输入密码', trigger: 'blur' },
      };
      const userStore = useUserStore();

      const router = useRouter();
      const route = useRoute();

      const handleLogin = (e) => {
        e.preventDefault();
        formRef.value.validate(async (errors) => {
          if (!errors) {
            const { email, password } = state.formInline;
            state.loginLoading = true;
            const params: FormState = {
              email,
              password,
            };
            const { code, msg } = await userStore.adminLogin(params);
            if (code == ResultEnum.SUCCESS) {
              // ?. 可选链
              const toPath = decodeURIComponent((route.query?.redirect || '/') as string);

              message.success('登录成功！');
              router.replace(toPath).then((_) => {
                if (route.name == 'login') {
                  router.replace('/');
                }
              });
            } else {
              message.info(msg || '登录失败');
            }
            state.loginLoading = false;
          } else {
            message.error('Error');
          }
        });
      };

      function testHalo() {
        console.log(handleLogin);
      }

      const handleSubmit = (e) => {
        e.preventDefault();
        formRef.value.validate(async (errors) => {
          if (!errors) {
            const { email, password } = state.formInline;
            message.loading('登录中...');
            state.loading = true;

            const params: FormState = {
              email,
              password,
            };

            const { code, message: msg } = await userStore.login(params);

            if (code == ResultEnum.SUCCESS) {
              const toPath = decodeURIComponent((route.query?.redirect || '/') as string);
              message.success('登录成功！');
              router.replace(toPath).then((_) => {
                if (route.name == 'login') {
                  router.replace('/');
                }
              });
            } else {
              message.info(msg || '登录失败');
            }
          } else {
            message.error('请填写完整信息，并且进行验证码校验');
          }
        });
      };

      return {
        ...toRefs(state),
        formRef,
        rules,
        logo,
        handleSubmit,
        handleLogin,
        testHalo,
      };
    },
  });
</script>

<style lang="less" scoped>
  .view-account {
    display: flex;
    flex-direction: column;
    height: 100vh;
    overflow: auto;

    .login-button {
      margin-right: 20px;
    }

    .register-button {
      margin-left: 20px;
    }

    &-container {
      flex: 1;
      padding: 32px 0;
      width: 384px;
      margin: 0 auto;
    }

    &-top {
      padding: 32px 0;
      text-align: center;

      &-desc {
        font-size: 14px;
        color: #808695;
      }
    }

    &-other {
      width: 100%;
    }

    .default-color {
      color: #515a6e;

      .ant-checkbox-wrapper {
        color: #515a6e;
      }
    }
  }

  @media (min-width: 768px) {
    .view-account {
      background-image: url('../../assets/images/login.svg');
      background-repeat: no-repeat;
      background-position: 50%;
      background-size: 100%;
    }

    .page-account-container {
      padding: 32px 0 24px 0;
    }
  }
</style>
