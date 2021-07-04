import { signIn, useSession } from 'next-auth/client';
import { useRouter } from 'next/router';
import { api } from '../../services/api';
import { getStripeJs } from '../../services/stripej-s';
import styles from './styles.module.scss';

interface SubscribeButtonProps {
  priceId: string;
}

function SubscribeButton({ priceId }: SubscribeButtonProps) {
  const [session] : any = useSession();
  const router = useRouter()

  async function hadnleSubscribe(){
    if(!session) {
      signIn('github')
      return;
    }

    if(session.activeSubscription){
      router.push('/posts')
      return;
    }

    try {
      const response = await api.post('/subscribe')

      const { sessionId } = response.data;

      console.log('sessionid: ',sessionId);

      const stripe = await getStripeJs()

      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <button
      type="button"
      className={styles.subscribeButton}
      onClick={hadnleSubscribe}
    >
      Subscibe Now
    </button>
  )
}

export default SubscribeButton;
