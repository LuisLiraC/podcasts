import ChannelGrid from '../components/ChannelGrid';
import Layout from '../components/Layout';
import PodcastListWithClick from '../components/PodcastListWithClick';
import Error from './_error';
import PodcastPlayer from '../components/PodcastPlayer';


export default class extends React.Component {

    constructor(props){
        super(props)
        this.state = {
            openPodcast: null
        }
    }

    static async getInitialProps({query, res}){
        let idChannel = query.id

        try{
            let [reqChannel, reqSeries, reqAudios] = await Promise.all([
                fetch(`https://api.audioboom.com/channels/${idChannel}`).then((response) => response.json()),
                fetch(`https://api.audioboom.com/channels/${idChannel}/child_channels`).then((response) => response.json()),
                fetch(`https://api.audioboom.com/channels/${idChannel}/audio_clips`).then((response) => response.json())
            ])
            
            if(reqChannel.status >= 404){
                res.statusCode = reqChannel.status
                return { channel: null, audioClips: null, series: null, statusCode: reqChannel.status}
            }
    
            let channel = reqChannel.body.channel;
            let series = reqSeries.body.channels;
            let audioClips = reqAudios.body.audio_clips;
    
            return { channel, audioClips, series, statusCode: 200 }
        } catch(e){
            return { channel: null, audioClips: null, series: null, statusCode: 503}
        }

    }

    openPodcast = (event, podcast) => {
        event.preventDefault()
        this.setState({
            openPodcast: podcast
        })
    }

    closePodcast = (event) => {
        event.preventDefault();
        this.setState({
            openPodcast: null
        })
    }

    render(){
        const {channel, audioClips, series, statusCode } = this.props;
        const {openPodcast} = this.state

        if( statusCode !== 200){
            return <Error statusCode={statusCode} />
        }

        return (
            <Layout title={channel.title} >
                <div className="banner" style={{ backgroundImage: `url(${channel.urls.banner_image.original})` }} />

                { openPodcast && 
                    <div className="modal">
                        <PodcastPlayer clip={openPodcast} onClose={this.closePodcast} />
                    </div>
                }

                <h1>{ channel.title }</h1>


                { series.length > 0 &&
                <div>
                    <h2>Series</h2>
                    <ChannelGrid channels={ series } />
                </div>
                }

                <h2>Últimos Podcasts</h2>
                <PodcastListWithClick podcasts={audioClips} 
                    onClickPodcast={this.openPodcast}
                />

                <style jsx>{`
                    .banner {
                        width: 100%;
                        padding-bottom: 25%;
                        background-position: 50% 50%;
                        background-size: cover;
                        background-color: #aaa;
                    }
                    h1 {
                        font-weight: 600;
                        padding: 15px;
                    }
                    h2 {
                        padding: 15px;
                        font-size: 1.2em;
                        font-weight: 600;
                        margin: 0;
                    }
                    .modal {
                        position: fixed;
                        top: 0;
                        left: 0;
                        right: 0;
                        bottom: 0;
                        z-index: 99999;
                    }
                `}</style>
            </Layout>
        )
    }
}